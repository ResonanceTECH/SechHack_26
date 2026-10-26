from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import not_found
from app.models.care import CarePlan, ExerciseAssignment, ExerciseCompletion
from app.models.user import User
from app.repositories.assessment_plan_repository import AssessmentPlanRepository
from app.repositories.diagnosis_repository import DiagnosisRepository
from app.repositories.patient_repository import PatientRepository
from app.schemas.patient import PatientUpdate
from app.services.assessment_plan_service import AssessmentPlanService


class PatientService:
    """Patient service containing business logic.

    Orchestrates patient operations: RBAC validation, clinic isolation, and coordination
    between repository and schemas. All business logic lives here; routers are thin.
    """

    def __init__(self, repository: PatientRepository):
        self.repository = repository

    async def list_patients(
        self,
        db: AsyncSession,
        current_user: User,
        search: str | None = None,
    ) -> dict:
        """List patients based on user RBAC role."""
        result = await self.repository.get_patients_by_user(db, str(getattr(current_user, "id", "")), current_user, search)
        return {"patients": result}

    async def get_patient(
        self,
        db: AsyncSession,
        patient_id: str,
        current_user: User,
    ) -> dict:
        """Get patient detail by ID with RBAC validation."""
        result = await self.repository.get_patient_by_id(db, patient_id, current_user)
        if not result:
            raise not_found("Пациент не найден")
        return result

    async def update_patient(
        self,
        db: AsyncSession,
        patient_id: str,
        body: PatientUpdate,
        current_user: User,
    ) -> dict:
        """Update patient data with RBAC validation."""
        data = body.model_dump(exclude_unset=True)
        result = await self.repository.update_patient(db, patient_id, data, current_user)
        if not result:
            raise not_found("Пациент не найден")
        return result

    async def get_patient_card(
        self,
        db: AsyncSession,
        patient_id: str,
        current_user: User,
    ) -> dict:
        """Aggregated patient card merging summary and home blocks."""
        summary = await self.get_patient_summary(db, patient_id, current_user)
        home = await self.get_patient_home(db, patient_id, current_user)
        result = dict(summary or {})
        result["home"] = home
        return result

    async def get_patient_summary(
        self,
        db: AsyncSession,
        patient_id: str,
        current_user: User,
    ) -> dict:
        """Get patient summary for MVP endpoint."""
        result = await self.repository.get_patient_summary(db, patient_id, current_user)
        if not result:
            raise not_found("Пациент не найден")

        diagnoses = await DiagnosisRepository().list_by_patient(db, patient_id)
        result["diagnoses"] = {
            "active": [d.code for d in diagnoses if d.status == "active"],
            "primary": next((d.code for d in diagnoses if d.is_primary and d.status == "active"), None),
            "total": len(diagnoses),
        }

        assessment = await AssessmentPlanService(AssessmentPlanRepository()).patient_summary_assessment(db, patient_id)
        result["assessment"] = assessment

        # Adherence block — care plan / exercise completion stats
        try:
            pid = UUID(str(patient_id))
        except (ValueError, AttributeError):
            pid = None

        active_care_plans = 0
        total_assignments = 0
        completed_assignments = 0
        latest_completion_at = None
        if pid is not None:
            active_care_plans = (await db.execute(
                select(func.count()).select_from(CarePlan).where(
                    CarePlan.patient_id == pid,
                    CarePlan.status == "active",
                )
            )).scalar_one()

            total_assignments = (await db.execute(
                select(func.count()).select_from(ExerciseAssignment).join(
                    CarePlan, ExerciseAssignment.care_plan_id == CarePlan.id
                ).where(CarePlan.patient_id == pid)
            )).scalar_one()

            completed_assignments = (await db.execute(
                select(func.count()).select_from(ExerciseCompletion).where(
                    ExerciseCompletion.patient_id == pid,
                    ExerciseCompletion.completed.is_(True),
                )
            )).scalar_one()

            latest = (await db.execute(
                select(ExerciseCompletion.created_at).where(
                    ExerciseCompletion.patient_id == pid
                ).order_by(ExerciseCompletion.created_at.desc()).limit(1)
            )).scalar_one_or_none()
            if latest is not None:
                latest_completion_at = latest.isoformat()

        adherence_rate = (
            round(completed_assignments / total_assignments * 100) if total_assignments else 0
        )
        result["adherence"] = {
            "active_care_plans": active_care_plans,
            "total_assignments": total_assignments,
            "completed_assignments": completed_assignments,
            "adherence_rate": adherence_rate,
            "latest_completion_at": latest_completion_at,
        }
        return result
    async def get_patient_home(
        self,
        db: AsyncSession,
        patient_id: str,
        current_user: User,
    ) -> dict:
        """Aggregated home view for a patient (mobile/web home screen)."""
        patient = await self.get_patient(db, patient_id, current_user)

        from app.repositories.alert_repository import AlertRepository
        alerts, _ = await AlertRepository().list_alerts(db, {"patient_id": patient_id, "status": "new"})

        from app.repositories.diary_repository import DiaryRepository
        entries = await DiaryRepository().list_for_patient(db, patient_id, limit=1)
        latest = entries[0] if entries else None
        latest_diary = None
        if latest is not None:
            latest_diary = {
                "id": str(latest.id),
                "recorded_at": latest.recorded_at.isoformat() if getattr(latest, "recorded_at", None) else None,
                "mood_score": getattr(latest, "mood_score", None),
                "anxiety_score": getattr(latest, "anxiety_score", None),
                "sleep_hours": getattr(latest, "sleep_hours", None),
                "sleep_quality": getattr(latest, "sleep_quality", None),
            }

        from app.repositories.appointment_repository import AppointmentRepository
        from datetime import datetime, timezone
        appts = await AppointmentRepository().list_appointments(db, patient_id=patient_id, status="scheduled")
        now = datetime.now(timezone.utc)
        upcoming = [a for a in appts if getattr(a, "scheduled_at", None) and a.scheduled_at >= now]
        next_appt = upcoming[0] if upcoming else None
        next_appointment = None
        if next_appt is not None:
            next_appointment = {
                "id": str(next_appt.id),
                "scheduled_at": next_appt.scheduled_at.isoformat() if getattr(next_appt, "scheduled_at", None) else None,
                "status": getattr(next_appt, "status", None),
                "reason": getattr(next_appt, "reason", None),
                "practitioner_id": str(next_appt.practitioner_id) if getattr(next_appt, "practitioner_id", None) else None,
            }

        from datetime import datetime, timezone
        today = datetime.now(timezone.utc).date()
        today_tasks = []
        checkin_completed = False
        if latest_diary is not None and latest_diary.get("recorded_at") is not None:
            try:
                recorded = latest_diary["recorded_at"]
                if isinstance(recorded, str):
                    recorded_date = recorded[:10]
                else:
                    recorded_date = recorded.date().isoformat() if recorded is not None else ""
                checkin_completed = recorded_date == today.isoformat()
            except Exception:
                checkin_completed = False
        today_tasks.append({"type": "checkin", "title": "Отметка настроения", "completed": checkin_completed})
        try:
            from sqlalchemy import select
            from app.models.medication import Prescription, Medication
            pres_rows = (await db.execute(
                select(Prescription, Medication).join(Medication, Medication.id == Prescription.medication_id).where(
                    Prescription.patient_id == UUID(str(patient_id)),
                    Prescription.is_active.is_(True),
                )
            )).all()
            from datetime import datetime, timezone
            from app.models.medication import MedicationAdherence
            for pres, med in pres_rows:
                completed = False
                try:
                    adh = (await db.execute(
                        select(MedicationAdherence).where(
                            MedicationAdherence.prescription_id == pres.id,
                            MedicationAdherence.taken_at >= datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc),
                            MedicationAdherence.taken_at < datetime.combine(today, datetime.max.time(), tzinfo=timezone.utc),
                        )
                    )).scalars().first()
                    if adh is not None:
                        completed = bool(adh.is_taken)
                except Exception:
                    completed = False
                today_tasks.append({"type": "medication", "title": f"{med.name} {pres.dosage}", "related_id": str(pres.id), "completed": completed})
        except Exception:
            pass
        if next_appointment is not None and next_appointment.get("scheduled_at") is not None:
            try:
                sched = next_appointment["scheduled_at"]
                if isinstance(sched, str):
                    sched_date = sched[:10]
                else:
                    sched_date = sched.date().isoformat() if sched is not None else ""
                if sched_date == today.isoformat():
                    today_tasks.append({"type": "appointment", "title": "Приём", "related_id": next_appointment.get("id"), "completed": False, "scheduled_at": next_appointment.get("scheduled_at")})
            except Exception:
                pass
        return {
            "patient": patient,
            "alerts": {"active": len(alerts)},
            "latest_diary": latest_diary,
            "next_appointment": next_appointment,
            "today_tasks": today_tasks,
        }
