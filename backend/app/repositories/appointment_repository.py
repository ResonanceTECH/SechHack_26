"""Appointment repository."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment


class AppointmentRepository:
    async def create_appointment(self, db: AsyncSession, data: dict) -> Appointment:
        row = Appointment(
            patient_id=uuid.UUID(str(data["patient_id"])),
            practitioner_id=uuid.UUID(str(data["practitioner_id"])),
            clinic_id=uuid.UUID(str(data["clinic_id"])),
            scheduled_at=data["scheduled_at"],
            status=data.get("status") or "scheduled",
            reason=data.get("reason"),
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_appointment(self, db: AsyncSession, appointment_id: str) -> Appointment | None:
        try:
            aid = uuid.UUID(str(appointment_id))
        except ValueError:
            return None
        return (await db.execute(select(Appointment).where(Appointment.id == aid))).scalar_one_or_none()

    async def list_appointments(
        self,
        db: AsyncSession,
        *,
        patient_id: str | None = None,
        practitioner_id: str | None = None,
        status: str | None = None,
    ) -> list[Appointment]:
        q = select(Appointment)
        if patient_id:
            try:
                pid = uuid.UUID(str(patient_id))
            except ValueError:
                return []
            q = q.where(Appointment.patient_id == pid)
        if practitioner_id:
            try:
                prid = uuid.UUID(str(practitioner_id))
            except ValueError:
                return []
            q = q.where(Appointment.practitioner_id == prid)
        if status:
            q = q.where(Appointment.status == status)
        q = q.order_by(Appointment.scheduled_at.asc())
        return list((await db.execute(q)).scalars().all())