"""FastAPI router for user profile endpoints."""

from __future__ import annotations

import uuid
from datetime import date

from fastapi import APIRouter, Request, status
from sqlalchemy import select

from app.api.dependencies import CurrentUser, DbSession
from app.core.errors import forbidden, not_found
from app.models.profile import PatientProfile, PractitionerProfile
from app.models.user import User
from app.schemas.common import EnvelopeResponse
from app.schemas.user import UserOut, UserUpdate


router = APIRouter(prefix="/api/v1/users", tags=["users"])


def _rid(request: Request) -> str:
    return getattr(request.state, "request_id", "")


def _can_edit(current_user: User, target_id: uuid.UUID) -> bool:
    if str(current_user.id) == str(target_id):
        return True
    return current_user.role in ("super_admin", "clinic_admin")


async def _load(db: DbSession, user_id: uuid.UUID) -> tuple[User, PatientProfile | None, PractitionerProfile | None]:
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if user is None:
        raise not_found("Пользователь не найден")
    patient = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == user_id))).scalar_one_or_none()
    practitioner = (await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == user_id))).scalar_one_or_none()
    return user, patient, practitioner


def _serialize(user: User, patient: PatientProfile | None, practitioner: PractitionerProfile | None) -> dict:
    profile = patient or practitioner
    return UserOut(
        id=str(user.id),
        email=user.email,
        phone=user.phone,
        role=user.role,
        first_name=getattr(profile, "first_name", None),
        last_name=getattr(profile, "last_name", None),
        middle_name=getattr(profile, "middle_name", None),
        birth_date=patient.birth_date.isoformat() if patient and patient.birth_date else None,
        gender=patient.gender if patient else None,
    ).model_dump()


@router.get("/{user_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def get_user(user_id: str, current_user: CurrentUser, db: DbSession, request: Request) -> dict:
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise not_found("Пользователь не найден")
    if not _can_edit(current_user, uid) and current_user.role not in ("doctor", "psychologist", "coordinator"):
        # patients can read self only; clinicians can read any? keep simple: self or admin
        if str(current_user.id) != str(uid):
            raise forbidden()
    user, patient, practitioner = await _load(db, uid)
    if str(current_user.id) != str(uid) and current_user.role not in ("super_admin", "clinic_admin", "doctor", "psychologist", "coordinator"):
        raise forbidden()
    return {"data": _serialize(user, patient, practitioner), "request_id": _rid(request)}


@router.patch("/{user_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def update_user(user_id: str, body: UserUpdate, current_user: CurrentUser, db: DbSession, request: Request) -> dict:
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise not_found("Пользователь не найден")
    if not _can_edit(current_user, uid):
        raise forbidden()
    user, patient, practitioner = await _load(db, uid)

    data = body.model_dump(exclude_unset=True)
    if "email" in data and data["email"] is not None:
        user.email = data["email"]
    if "phone" in data and data["phone"] is not None:
        user.phone = data["phone"]

    profile = patient or practitioner
    if profile is not None:
        for key in ("first_name", "last_name", "middle_name", "gender"):
            if key in data and data[key] is not None:
                setattr(profile, key, data[key])
        if "birth_date" in data and data["birth_date"] is not None and patient is not None:
            patient.birth_date = date.fromisoformat(data["birth_date"])

    await db.commit()
    await db.refresh(user)
    if patient is not None:
        await db.refresh(patient)
    if practitioner is not None:
        await db.refresh(practitioner)
    user, patient, practitioner = await _load(db, uid)
    return {"data": _serialize(user, patient, practitioner), "request_id": _rid(request)}
