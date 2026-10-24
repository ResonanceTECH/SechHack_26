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


class ReportService:
    async def pre_visit_report(self, db: AsyncSession, patient_id: str) -> dict | None:
        try:
            pid = uuid.UUID(str(patient_id))
        except ValueError:
            return None
        patient = await db.get(PatientProfile, pid)
        if patient is None:
            return None

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

    async def clinic_analytics(self, db: AsyncSession) -> dict:
        patients_total = (await db.execute(select(func.count()).select_from(PatientProfile))).scalar() or 0
        practitioners_total = (await db.execute(select(func.count()).select_from(PractitionerProfile))).scalar() or 0
        appointments_total = (await db.execute(select(func.count()).select_from(Appointment))).scalar() or 0
        screenings_total = (await db.execute(select(func.count()).select_from(ScreeningResult))).scalar() or 0
        diary_entries_total = (await db.execute(select(func.count()).select_from(DiaryEntry))).scalar() or 0

        status_rows = (
            await db.execute(
                select(Appointment.status, func.count()).group_by(Appointment.status)
            )
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
