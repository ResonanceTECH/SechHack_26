"""Appointment service."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import forbidden
from app.models.appointment import Appointment
from app.models.profile import PatientProfile, PractitionerProfile
from app.repositories.appointment_repository import AppointmentRepository
from app.services.clinic_isolation import practitioner_clinic_ids, patient_clinic_id, enforce_clinic_match


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
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics:
                allowed = {str(c) for c in p_clinics}
                items = [a for a in items if str(a.clinic_id) in allowed]
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
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics:
                pat_clinic = await patient_clinic_id(db, data.get("patient_id"))
                enforce_clinic_match(p_clinics, pat_clinic)
                data["clinic_id"] = pat_clinic if pat_clinic in p_clinics else p_clinics[0]
        return await self.repo.create_appointment(db, data)

    async def update_appointment(self, db: AsyncSession, appointment_id: str, data: dict, current_user=None) -> "Appointment | None":
        row = await self.repo.get_appointment(db, appointment_id)
        if row is None:
            return None
        if current_user is not None and getattr(current_user, "role", None) not in ("patient", "super_admin"):
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics:
                pc = await patient_clinic_id(db, str(row.patient_id))
                if pc is not None and pc not in p_clinics:
                    from app.core.errors import forbidden
                    raise forbidden()
        from app.services.version_service import EntityVersionService
        await EntityVersionService().record(
            db, entity_type="appointment", entity_id=str(row.id),
            changed_by=str(current_user.id) if current_user is not None else None,
            reason="update", is_addendum=False,
            snapshot={"id": str(row.id), "patient_id": str(row.patient_id), "practitioner_id": str(row.practitioner_id), "clinic_id": str(row.clinic_id), "scheduled_at": row.scheduled_at.isoformat() if row.scheduled_at else None, "status": row.status, "reason": row.reason},
        )
        return await self.repo.update_appointment(db, appointment_id, data)
