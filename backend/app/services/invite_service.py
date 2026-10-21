"""Invite-коды: генерация врачом и проверка пациентом (AUTH_PLAN.md §3.2).

Алфавит по спецификации команды: 23456789ABCDEFGHJKLMNPQRSTUVWXYZ
(исключены только 0/1/I/O). Формат: PREFIX-NNNNN, где префикс задаёт врач/клиника,
5 символов из алфавита. На бэкенд код приходит БЕЗ дефиса («RAV27400») —
дефис только UI-маска мобилки.
"""

from __future__ import annotations

import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import conflict, forbidden, not_found
from app.db.base import utcnow
from app.models.assignment import PatientAssignment
from app.models.auth import InviteCode
from app.models.profile import PatientProfile, PractitionerProfile
from app.models.user import User
from app.services import audit_service

# U и L входят в алфавит по спецификации команды (исключены только 0/1/I/O)
ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
CODE_BODY_LENGTH = 5
DEFAULT_PREFIX = "RAV"


def generate_code_body() -> str:
    """5 символов из безопасного алфавита."""
    return "".join(secrets.choice(ALPHABET) for _ in range(CODE_BODY_LENGTH))


async def create_invite_code(
    session: AsyncSession,
    *,
    practitioner: PractitionerProfile,
    expires_in_days: int = 30,
    is_multi_use: bool = False,
    max_uses: int | None = None,
) -> InviteCode:
    """Создать invite-код. Генерация с проверкой коллизий; уникальность —
    гарантируется и на уровне БД."""
    for _ in range(10):  # 32^5 ≈ 33M комбинаций — коллизии практически исключены
        code = DEFAULT_PREFIX + generate_code_body()
        exists = (
            await session.execute(select(InviteCode).where(InviteCode.code == code))
        ).scalar_one_or_none()
        if exists is None:
            invite = InviteCode(
                code=code,
                practitioner_id=practitioner.id,
                clinic_id=practitioner.clinic_id,
                expires_at=utcnow() + timedelta(days=expires_in_days),
                is_multi_use=is_multi_use,
                max_uses=max_uses if is_multi_use else 1,
            )
            session.add(invite)
            await session.commit()
            await session.refresh(invite)
            return invite
    raise conflict("Не удалось сгенерировать уникальный код, попробуйте ещё раз")


async def verify_invite_code(
    session: AsyncSession, *, user: User, code: str
) -> PatientAssignment:
    """Привязать пациента к врачу по invite-коду. Код приходит уже
    нормализованным (без дефиса, верхний регистр) — см. InviteVerifyRequest."""
    invite = (
        await session.execute(select(InviteCode).where(InviteCode.code == code))
    ).scalar_one_or_none()
    if invite is None or not invite.is_active or invite.expires_at < datetime.now(UTC):
        raise not_found("Invite-код не найден или просрочен")

    if not invite.is_multi_use and invite.uses_count >= 1:
        raise conflict("Invite-код уже использован")
    if invite.max_uses is not None and invite.uses_count >= invite.max_uses:
        raise conflict("Invite-код уже использован")

    # Пациент должен иметь профиль (создаётся при SMS-регистрации)
    profile = (
        await session.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))
    ).scalar_one_or_none()
    if profile is None:
        raise forbidden("Профиль пациента не найден")

    # Идемпотентность: повторная привязка к тому же врачу — не ошибка
    existing = (
        await session.execute(
            select(PatientAssignment).where(
                PatientAssignment.patient_id == profile.id,
                PatientAssignment.practitioner_id == invite.practitioner_id,
                PatientAssignment.clinic_id == invite.clinic_id,
            )
        )
    ).scalar_one_or_none()
    if existing is not None and existing.is_active:
        return existing

    assignment = PatientAssignment(
        patient_id=profile.id,
        practitioner_id=invite.practitioner_id,
        clinic_id=invite.clinic_id,
    )
    session.add(assignment)
    await session.flush()  # получить assignment.id до аудита и коммита
    await session.execute(
        update(InviteCode)
        .where(InviteCode.id == invite.id)
        .values(uses_count=InviteCode.uses_count + 1)
    )
    await audit_service.record(
        session,
        user_id=user.id,
        action="invite.verify",
        entity_type="PatientAssignment",
        entity_id=assignment.id,
        new_values={
            "practitioner_id": str(invite.practitioner_id),
            "clinic_id": str(invite.clinic_id),
        },
    )
    await session.commit()
    await session.refresh(assignment)
    return assignment


async def list_practitioner_codes(
    session: AsyncSession, *, practitioner_id: uuid.UUID
) -> list[InviteCode]:
    """Список invite-кодов специалиста (для кабинета врача)."""
    result = await session.execute(
        select(InviteCode)
        .where(InviteCode.practitioner_id == practitioner_id)
        .order_by(InviteCode.created_at.desc())
    )
    return list(result.scalars().all())
