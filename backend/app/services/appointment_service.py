"""Appointment service."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import PatientProfile, PractitionerProfile
from app.repositories.appointment_repository import AppointmentRepository


class AppointmentService:
    def __init__(self, repo: AppointmentRepository | None = None):
        self.repo = repo or AppointmentRepository()

    async def _patient_profile(self, db: AsyncSession, user) -> PatientProfile | None:
        res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == uuid.UUID(str(user.id))))
        return res.scalar_one_or_none()

    async def list_appointments(self, db: AsyncSession, current_user, patient_id: str | None = None) -> list:
        if getattr(current_user, "role", "") == "patient":
            prof = await self._patient_profile(db, current_user)
            if prof is None:
                return []
            pid = str(prof.id)
            if patient_id and patient_id != pid:
                return []
            return await self.repo.list_appointments(db, patient_id=pid)
        return await self.repo.list_appointments(db, patient_id=patient_id)

    async def create_appointment(self, db: AsyncSession, current_user, data: dict) -> "Appointment":
        data = dict(data)
        # derive clinic_id from practitioner profile if not provided
        if not data.get("clinic_id"):
            try:
                prid = uuid.UUID(str(data["practitioner_id"]))
            except (ValueError, KeyError):
                prid = None
            if prid is not None:
                res = await db.execute(select(PractitionerProfile).where(PractitionerProfile.id == prid))
                prof = res.scalar_one_or_none()
                if prof is not None:
                    data["clinic_id"] = str(prof.clinic_id)
        return await self.repo.create_appointment(db, data)