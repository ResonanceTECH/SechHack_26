"""Shared clinic-isolation helpers for services."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import forbidden
from app.models.profile import PatientProfile, PractitionerProfile


async def practitioner_clinic_id(db, user) -> str | None:
    role = getattr(user, "role", None)
    if role not in ("doctor", "psychologist", "coordinator", "clinic_admin"):
        return None
    res = await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == uuid.UUID(str(user.id))))
    prof = res.scalar_one_or_none()
    return str(prof.clinic_id) if prof is not None and prof.clinic_id is not None else None


async def patient_clinic_id(db, patient_id) -> str | None:
    try:
        pid = uuid.UUID(str(patient_id))
    except (ValueError, TypeError):
        return None
    prof = await db.get(PatientProfile, pid)
    return str(prof.clinic_id) if prof is not None and prof.clinic_id is not None else None


def enforce_clinic_match(practitioner_clinic, patient_clinic) -> None:
    if practitioner_clinic is not None and patient_clinic is not None and practitioner_clinic != patient_clinic:
        raise forbidden("Clinic isolation violation")
