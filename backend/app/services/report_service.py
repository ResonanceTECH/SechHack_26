"""Report service: JSON aggregates for pre-visit and clinic analytics."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment
from app.models.care import CarePlan
from app.models.clinical import DiaryEntry, ScreeningResult
from app.models.diagnosis import PatientDiagnosis
from app.models.profile import PatientProfile, PractitionerProfile
from app.services.clinic_isolation import practitioner_clinic_ids


class ReportService:
    async def pre_visit_report(self, db: AsyncSession, patient_id: str, current_user=None) -> dict | None:
        try:
            pid = uuid.UUID(str(patient_id))
        except ValueError:
            return None
        patient = await db.get(PatientProfile, pid)
        if patient is None:
            return None
        if current_user is not None:
            role = getattr(current_user, "role", None)
            if role not in ("super_admin", "patient"):
                p_clinics = await practitioner_clinic_ids(db, current_user)
                if p_clinics and str(patient.clinic_id) not in p_clinics:
                    from app.core.errors import forbidden
                    raise forbidden("Clinic isolation violation")

        diagnoses = list(
            (
                await db.execute(
                    select(PatientDiagnosis)
                    .where(PatientDiagnosis.patient_id == pid)
                    .order_by(PatientDiagnosis.diagnosed_at.desc())
                )
            ).scalars().all()
        )
        care_plans = list(
            (
                await db.execute(
                    select(CarePlan)
                    .where(CarePlan.patient_id == pid)
                    .order_by(CarePlan.created_at.desc())
                )
            ).scalars().all()
        )
        appointments = list(
            (
                await db.execute(
                    select(Appointment)
                    .where(Appointment.patient_id == pid)
                    .order_by(Appointment.scheduled_at.desc())
                )
            ).scalars().all()
        )
        screenings = list(
            (
                await db.execute(
                    select(ScreeningResult)
                    .where(ScreeningResult.patient_id == pid)
                    .order_by(ScreeningResult.created_at.desc())
                    .limit(10)
                )
            ).scalars().all()
        )

        since = datetime.now(timezone.utc) - timedelta(days=14)
        diary_rows = list(
            (
                await db.execute(
                    select(DiaryEntry).where(
                        DiaryEntry.patient_id == pid,
                        DiaryEntry.recorded_at >= since,
                    )
                )
            ).scalars().all()
        )
        diary_summary = {
            "entries": len(diary_rows),
            "avg_mood": _avg([r.mood_score for r in diary_rows]),
            "avg_anxiety": _avg([r.anxiety_score for r in diary_rows]),
            "avg_energy": _avg([r.energy_score for r in diary_rows]),
            "avg_sleep_hours": _avg([r.sleep_hours for r in diary_rows]),
        }

        return {
            "patient": {
                "id": str(patient.id),
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "middle_name": patient.middle_name,
                "birth_date": patient.birth_date.isoformat() if patient.birth_date else None,
                "gender": patient.gender,
                "clinic_id": str(patient.clinic_id) if patient.clinic_id else None,
            },
            "diagnoses": [
                {
                    "id": str(d.id),
                    "coding_system": d.coding_system,
                    "code": d.code,
                    "title": d.title,
                    "status": d.status,
                    "is_primary": d.is_primary,
                    "diagnosed_at": d.diagnosed_at.isoformat() if d.diagnosed_at else None,
                }
                for d in diagnoses
            ],
            "care_plans": [
                {
                    "id": str(c.id),
                    "title": c.title,
                    "status": c.status,
                    "practitioner_id": str(c.practitioner_id),
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                }
                for c in care_plans
            ],
            "appointments": [
                {
                    "id": str(a.id),
                    "practitioner_id": str(a.practitioner_id),
                    "scheduled_at": a.scheduled_at.isoformat() if a.scheduled_at else None,
                    "status": a.status,
                    "reason": a.reason,
                }
                for a in appointments
            ],
            "recent_screenings": [
                {
                    "id": str(s.id),
                    "questionnaire_type": s.questionnaire_type,
                    "score": s.score,
                    "severity": s.severity,
                    "is_critical": s.is_critical,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                }
                for s in screenings
            ],
            "diary_summary": diary_summary,
        }

    async def clinic_analytics(self, db: AsyncSession, current_user=None) -> dict:
        p_clinic = None
        if current_user is not None:
            role = getattr(current_user, "role", None)
            if role not in ("super_admin",):
                p_clinics = await practitioner_clinic_ids(db, current_user)
        patients_total_q = select(func.count()).select_from(PatientProfile)
        if p_clinics:
            patients_total_q = patients_total_q.where(PatientProfile.clinic_id.in_([uuid.UUID(c) for c in p_clinics]))
        patients_total = (await db.execute(patients_total_q)).scalar() or 0
        practitioners_total_q = select(func.count()).select_from(PractitionerProfile)
        if p_clinics:
            practitioners_total_q = practitioners_total_q.where(PractitionerProfile.clinic_id.in_([uuid.UUID(c) for c in p_clinics]))
        practitioners_total = (await db.execute(practitioners_total_q)).scalar() or 0
        appointments_total_q = select(func.count()).select_from(Appointment)
        if p_clinics:
            appointments_total_q = appointments_total_q.where(Appointment.clinic_id.in_([uuid.UUID(c) for c in p_clinics]))
        appointments_total = (await db.execute(appointments_total_q)).scalar() or 0
        screenings_total_q = select(func.count()).select_from(ScreeningResult).join(PatientProfile, PatientProfile.id == ScreeningResult.patient_id)
        if p_clinics:
            screenings_total_q = screenings_total_q.where(PatientProfile.clinic_id.in_([uuid.UUID(c) for c in p_clinics]))
        screenings_total = (await db.execute(screenings_total_q)).scalar() or 0
        diary_entries_total_q = select(func.count()).select_from(DiaryEntry).join(PatientProfile, PatientProfile.id == DiaryEntry.patient_id)
        if p_clinics:
            diary_entries_total_q = diary_entries_total_q.where(PatientProfile.clinic_id.in_([uuid.UUID(c) for c in p_clinics]))
        diary_entries_total = (await db.execute(diary_entries_total_q)).scalar() or 0

        status_q = select(Appointment.status, func.count()).group_by(Appointment.status)
        if p_clinics:
            status_q = status_q.where(Appointment.clinic_id.in_([uuid.UUID(c) for c in p_clinics]))
        status_rows = (
            await db.execute(status_q)
        ).all()
        appointments_by_status = {str(status): int(count) for status, count in status_rows}

        return {
            "patients_total": int(patients_total),
            "practitioners_total": int(practitioners_total),
            "appointments_total": int(appointments_total),
            "appointments_by_status": appointments_by_status,
            "screenings_total": int(screenings_total),
            "diary_entries_total": int(diary_entries_total),
        }


def _avg(values):
    nums = [v for v in values if v is not None]
    if not nums:
        return None
    return round(sum(nums) / len(nums), 2)
