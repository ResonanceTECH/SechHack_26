"""Diagnosis repository."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.diagnosis import PatientDiagnosis


class DiagnosisRepository:
    async def create(self, db: AsyncSession, data: dict) -> PatientDiagnosis:
        row = PatientDiagnosis(
            patient_id=uuid.UUID(str(data["patient_id"])),
            coding_system=data["coding_system"],
            code=data["code"],
            title=data.get("title"),
            is_primary=bool(data.get("is_primary", False)),
            status=data.get("status", "active"),
            diagnosed_at=data.get("diagnosed_at") or datetime.now(timezone.utc),
            ended_at=data.get("ended_at"),
            diagnosed_by=uuid.UUID(str(data["diagnosed_by"])) if data.get("diagnosed_by") else None,
            is_confirmed=bool(data.get("is_confirmed", True)),
            notes=data.get("notes"),
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_by_id(self, db: AsyncSession, diagnosis_id: str) -> PatientDiagnosis | None:
        try:
            did = uuid.UUID(str(diagnosis_id))
        except ValueError:
            return None
        return (await db.execute(select(PatientDiagnosis).where(PatientDiagnosis.id == did))).scalar_one_or_none()

    async def list_by_patient(self, db: AsyncSession, patient_id: str, coding_system: str | None = None) -> list[PatientDiagnosis]:
        try:
            pid = uuid.UUID(str(patient_id))
        except ValueError:
            return []
        q = select(PatientDiagnosis).where(PatientDiagnosis.patient_id == pid)
        if coding_system:
            q = q.where(PatientDiagnosis.coding_system == coding_system)
        q = q.order_by(PatientDiagnosis.diagnosed_at.desc())
        result = await db.execute(q)
        return list(result.scalars().all())

    async def list_all(self, db: AsyncSession, coding_system: str | None = None, clinic_id=None) -> list[PatientDiagnosis]:
        from app.models.profile import PatientProfile
        q = select(PatientDiagnosis).join(PatientProfile, PatientProfile.id == PatientDiagnosis.patient_id)
        if clinic_id is not None:
            q = q.where(PatientProfile.clinic_id == clinic_id)
        if coding_system:
            q = q.where(PatientDiagnosis.coding_system == coding_system)
        q = q.order_by(PatientDiagnosis.diagnosed_at.desc())
        result = await db.execute(q)
        return list(result.scalars().all())

    async def update(self, db: AsyncSession, diagnosis_id: str, data: dict) -> PatientDiagnosis | None:
        row = await self.get_by_id(db, diagnosis_id)
        if row is None:
            return None
        for key, value in data.items():
            if value is None:
                continue
            if key in ("patient_id",):
                continue
            if key in ("diagnosed_by",) and value is not None:
                value = uuid.UUID(str(value))
            if hasattr(row, key):
                setattr(row, key, value)
        if data.get("status") in ("resolved", "closed", "remission") and data.get("ended_at") is None and row.ended_at is None:
            # auto-set ended_at for closed/resolved
            if data.get("status") in ("resolved", "closed"):
                row.ended_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(row)
        return row
