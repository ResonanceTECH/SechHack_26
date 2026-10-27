"""Assessment plan repository."""

from __future__ import annotations

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.assessment_plan import AssessmentPlan


class AssessmentPlanRepository:
    async def create(self, db: AsyncSession, data: dict) -> AssessmentPlan:
        row = AssessmentPlan(
            patient_id=uuid.UUID(str(data["patient_id"])),
            diagnosis_id=uuid.UUID(str(data["diagnosis_id"])) if data.get("diagnosis_id") else None,
            questionnaire_code=data["questionnaire_code"],
            interval_days=int(data["interval_days"]),
            enabled=bool(data.get("enabled", True)),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            created_by=uuid.UUID(str(data["created_by"])) if data.get("created_by") else None,
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_by_id(self, db: AsyncSession, plan_id: str) -> AssessmentPlan | None:
        try:
            pid = uuid.UUID(str(plan_id))
        except ValueError:
            return None
        return (await db.execute(select(AssessmentPlan).where(AssessmentPlan.id == pid))).scalar_one_or_none()

    async def list_by_patient(self, db: AsyncSession, patient_id: str) -> list[AssessmentPlan]:
        try:
            pid = uuid.UUID(str(patient_id))
        except ValueError:
            return []
        result = await db.execute(
            select(AssessmentPlan).where(AssessmentPlan.patient_id == pid).order_by(AssessmentPlan.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_all(self, db: AsyncSession, clinic_id=None) -> list[AssessmentPlan]:
        from app.models.profile import PatientProfile

        q = select(AssessmentPlan).join(PatientProfile, PatientProfile.id == AssessmentPlan.patient_id)
        if clinic_id is not None:
            if isinstance(clinic_id, (list, tuple, set)):
                ids = [str(c) for c in clinic_id if c is not None]
                if ids:
                    q = q.where(PatientProfile.clinic_id.in_(ids))
                else:
                    return []
            else:
                q = q.where(PatientProfile.clinic_id == clinic_id)
        q = q.order_by(AssessmentPlan.created_at.desc())
        result = await db.execute(q)
        return list(result.scalars().all())

    async def update(self, db: AsyncSession, plan_id: str, data: dict) -> AssessmentPlan | None:
        row = await self.get_by_id(db, plan_id)
        if row is None:
            return None
        if "diagnosis_id" in data:
            row.diagnosis_id = uuid.UUID(str(data["diagnosis_id"])) if data.get("diagnosis_id") else None
        for key in ("questionnaire_code", "interval_days", "enabled", "start_date", "end_date"):
            if key in data and data[key] is not None:
                setattr(row, key, data[key])
        # allow explicit disable: enabled can be False
        if "enabled" in data and data["enabled"] is not None:
            row.enabled = bool(data["enabled"])
        await db.commit()
        await db.refresh(row)
        return row

    async def delete(self, db: AsyncSession, plan_id: str) -> bool:
        row = await self.get_by_id(db, plan_id)
        if row is None:
            return False
        await db.delete(row)
        await db.commit()
        return True
