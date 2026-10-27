"""Assignment repository."""
from __future__ import annotations

import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.assignment import PatientAssignment


class AssignmentRepository:
    async def create(self, db: AsyncSession, data: dict) -> PatientAssignment:
        row = PatientAssignment(
            patient_id=uuid.UUID(str(data["patient_id"])),
            practitioner_id=uuid.UUID(str(data["practitioner_id"])),
            clinic_id=uuid.UUID(str(data["clinic_id"])),
            is_active=bool(data.get("is_active", True)),
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def list(self, db: AsyncSession, patient_id: str | None = None, practitioner_id: str | None = None) -> list[PatientAssignment]:
        q = select(PatientAssignment)
        if patient_id:
            q = q.where(PatientAssignment.patient_id == uuid.UUID(str(patient_id)))
        if practitioner_id:
            q = q.where(PatientAssignment.practitioner_id == uuid.UUID(str(practitioner_id)))
        q = q.order_by(PatientAssignment.assigned_at.desc())
        return list((await db.execute(q)).scalars().all())

    async def get(self, db: AsyncSession, assignment_id: str) -> PatientAssignment | None:
        try:
            aid = uuid.UUID(str(assignment_id))
        except ValueError:
            return None
        return (await db.execute(select(PatientAssignment).where(PatientAssignment.id == aid))).scalar_one_or_none()

    async def deactivate(self, db: AsyncSession, assignment_id: str) -> PatientAssignment | None:
        row = await self.get(db, assignment_id)
        if row is None:
            return None
        row.is_active = False
        await db.commit()
        await db.refresh(row)
        return row
