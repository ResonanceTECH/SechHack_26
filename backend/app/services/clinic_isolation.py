"""Shared clinic-isolation helpers for services."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import forbidden
from app.models.profile import PatientProfile, PractitionerProfile
from app.models.clinic_membership import PractitionerClinicMembership


async def practitioner_clinic_ids(db, user) -> list[str]:
    role = getattr(user, "role", None)
    if role not in ("doctor", "psychologist", "coordinator", "clinic_admin"):
        return []
    try:
        user_uuid = uuid.UUID(str(user.id))
    except (ValueError, TypeError):
        return []
    result: list[str] = []
    res = await db.execute(
        select(PractitionerProfile).where(PractitionerProfile.user_id == user_uuid)
    )
    prof = res.scalar_one_or_none()
    if prof is not None and prof.clinic_id is not None:
        result.append(str(prof.clinic_id))

    memberships = (
        await db.execute(
            select(PractitionerClinicMembership).where(
                PractitionerClinicMembership.practitioner_id == user_uuid
            )
        )
    ).scalars().all()
    for membership in memberships:
        cid = str(membership.clinic_id)
        if cid not in result:
            result.append(cid)
    return result


async def practitioner_clinic_id(db, user) -> str | None:
    ids = await practitioner_clinic_ids(db, user)
    return ids[0] if ids else None


async def patient_clinic_id(db, patient_id) -> str | None:
    try:
        pid = uuid.UUID(str(patient_id))
    except (ValueError, TypeError):
        return None
    prof = await db.get(PatientProfile, pid)
    return str(prof.clinic_id) if prof is not None and prof.clinic_id is not None else None


def enforce_clinic_match(practitioner_clinics, patient_clinic) -> None:
    if patient_clinic is None:
        return
    allowed = (
        practitioner_clinics
        if isinstance(practitioner_clinics, (list, tuple, set))
        else [practitioner_clinics]
    )
    allowed = [str(c) for c in allowed if c is not None]
    if not allowed:
        return
    if str(patient_clinic) not in allowed:
        raise forbidden("Clinic isolation violation")
