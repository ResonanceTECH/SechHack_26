"""Appointment service."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import forbidden
from app.models.profile import PatientProfile, PractitionerProfile
from app.repositories.appointment_repository import AppointmentRepository
from app.services.clinic_isolation import practitioner_clinic_id, patient_clinic_id, enforce_clinic_match


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
            items = await self.repo.list_appointments(db, patient_id=pid)
            return items
        items = await self.repo.list_appointments(db, patient_id=patient_id)
        role = getattr(current_user, "role", None)
        if role not in ("super_admin",):
            p_clinic = await practitioner_clinic_id(db, current_user)
            if p_clinic is not None:
                items = [a for a in items if str(a.clinic_id) == p_clinic]
        return items

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
        role = getattr(current_user, "role", None)
        if role not in ("patient", "super_admin"):
            p_clinic = await practitioner_clinic_id(db, current_user)
            if p_clinic is not None:
                pat_clinic = await patient_clinic_id(db, data.get("patient_id"))
                enforce_clinic_match(p_clinic, pat_clinic)
                data["clinic_id"] = p_clinic
        return await self.repo.create_appointment(db, data)