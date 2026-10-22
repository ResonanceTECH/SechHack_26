"""Эндпоинты специалистов: invite-коды (API_CONTRACTS.md §3).

Доступ: doctor, clinic_admin. Генерация и просмотр кодов привязки пациентов.
"""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import select

from app.api.dependencies import DbSession, require_roles
from app.core.errors import not_found
from app.core.response import envelope
from app.models.profile import PractitionerProfile
from app.models.user import User
from app.schemas.auth import InviteCodeCreateRequest, InviteCodeResponse
from app.schemas.common import EnvelopeResponse
from app.services import invite_service

router = APIRouter(prefix="/api/v1/practitioners", tags=["practitioners"])

# FastAPI не позволяет совмещать Annotated[..., Depends] и дефолт Depends(...)
# в сигнатуре — выносим в именованный alias (TASKS.md: require_roles в deps)
DoctorOrAdmin = Annotated[User, Depends(require_roles("doctor", "clinic_admin"))]


def _rid(request: Request) -> str:
    return getattr(request.state, "request_id", "")


async def _get_practitioner(db: DbSession, practitioner_id: uuid.UUID) -> PractitionerProfile:
    practitioner = (
        await db.execute(
            select(PractitionerProfile).where(PractitionerProfile.id == practitioner_id)
        )
    ).scalar_one_or_none()
    if practitioner is None:
        raise not_found("Специалист не найден")
    return practitioner


@router.get("/{practitioner_id}/invite-codes", response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 403: {"description": "Доступ запрещён"}, 404: {"description": "Специалист не найден"}})
async def list_invite_codes(
    practitioner_id: uuid.UUID,
    request: Request,
    db: DbSession,
    user: DoctorOrAdmin,
) -> dict:
    """Список invite-кодов специалиста."""
    await _get_practitioner(db, practitioner_id)
    codes = await invite_service.list_practitioner_codes(db, practitioner_id=practitioner_id)
    return envelope(
        data=[InviteCodeResponse.model_validate(c).model_dump(mode="json") for c in codes],
        request_id=_rid(request),
    )


@router.post("/{practitioner_id}/invite-codes", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 403: {"description": "Доступ запрещён"}, 404: {"description": "Специалист не найден"}, 422: {"description": "Ошибка валидации"}})
async def create_invite_code(
    practitioner_id: uuid.UUID,
    body: InviteCodeCreateRequest,
    request: Request,
    db: DbSession,
    user: DoctorOrAdmin,
) -> dict:
    """Генерация invite-кода врачом: алфавит 23456789ABCDEFGHJKLMNPQRSTUVWXYZ
    (без 0/1/I/O), TTL задаёт врач; code_display — с дефисом-маской."""
    practitioner = await _get_practitioner(db, practitioner_id)
    invite = await invite_service.create_invite_code(
        db,
        practitioner=practitioner,
        expires_in_days=body.expires_in_days,
        is_multi_use=body.is_multi_use,
        max_uses=body.max_uses,
    )
    data = InviteCodeResponse.model_validate(invite).model_dump(mode="json")
    # UI-маска: RAV27400 → RAV-27400 (дефис не хранится и не валидируется)
    data["code_display"] = f"{data['code'][:3]}-{data['code'][3:]}"
    return envelope(data=data, request_id=_rid(request))
