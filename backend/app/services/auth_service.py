"""Сервис аутентификации (AUTH_PLAN.md, API_CONTRACTS.md §2).

Регистрация (email+пароль), вход, SMS-вход (создание/вход по телефону),
refresh с rotation, logout, отзыв всех токенов, смена пароля.
"""

from __future__ import annotations

import hashlib
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import ApiError, conflict, invalid_credentials, unauthorized
from app.core.errors import not_found
from app.core.security import jwt as jwt_service
from app.core.security.passwords import hash_password, verify_password
from app.db.base import utcnow
from app.models.auth import RefreshToken
from app.models.profile import PatientProfile
from app.models.user import User
from app.schemas.auth import TokenPair
from app.services import audit_service


def _token_hash(token: str) -> str:
    """SHA-256 refresh-токена — в БД хранится только хеш (AUTH_PLAN.md §4)."""
    return hashlib.sha256(token.encode()).hexdigest()


async def _issue_tokens(
    session: AsyncSession, user: User, *, device_info: str | None = None
) -> TokenPair:
    """Создать пару access/refresh и сохранить сессию в refresh_tokens."""
    settings = get_settings()
    access = jwt_service.create_access_token(user_id=user.id, role=user.role)
    refresh = jwt_service.create_refresh_token(user_id=user.id, token_version=user.token_version)
    session.add(
        RefreshToken(
            user_id=user.id,
            token_hash=_token_hash(refresh),
            expires_at=utcnow() + timedelta(days=settings.refresh_token_expire_days),
            device_info=device_info,
        )
    )
    return TokenPair(
        access_token=access,
        refresh_token=refresh,
        expires_in=settings.access_token_ttl_seconds,
    )


async def register(
    session: AsyncSession,
    *,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
) -> tuple[User, TokenPair]:
    """Регистрация по email+пароль (роль по умолчанию — patient; согласия
    152-ФЗ уже проверены на уровне Pydantic-схемы)."""
    email_normalized = email.strip().lower()
    existing = (
        await session.execute(select(User).where(User.email == email_normalized))
    ).scalar_one_or_none()
    if existing is not None:
        raise conflict("Пользователь с таким email уже существует")

    user = User(
        email=email_normalized,
        password_hash=hash_password(password),
        role="patient",
        phone_verified=False,
    )
    session.add(user)
    await session.flush()  # получаем user.id

    session.add(
        PatientProfile(
            user_id=user.id,
            first_name=first_name,
            last_name=last_name,
            consent_personal_data=True,
            consent_medical_data=True,
            consent_data_processing_at=utcnow(),
        )
    )
    await audit_service.record(
        session,
        user_id=user.id,
        action="auth.register",
        entity_type="User",
        entity_id=user.id,
        new_values={"email": email_normalized, "role": "patient"},
    )
    tokens = await _issue_tokens(session, user)
    user.last_login_at = utcnow()
    await session.commit()
    return user, tokens


async def login(session: AsyncSession, *, email: str, password: str) -> tuple[User, TokenPair]:
    """Вход по email+пароль. Единый 401 при любом раскладе — защита от
    перечисления пользователей (AUTH_PLAN.md §8)."""
    email_normalized = email.strip().lower()
    user = (
        await session.execute(select(User).where(User.email == email_normalized))
    ).scalar_one_or_none()
    if user is None or not user.is_active or not verify_password(user.password_hash, password):
        raise invalid_credentials()
    return await _login_success(session, user)


async def login_by_phone(
    session: AsyncSession, *, phone: str, role: str = "patient"
) -> tuple[User, TokenPair]:
    """Вход/регистрация по телефону (после verify SMS-кода). Новый
    пользователь получает роль patient; согласия 152-ФЗ подтверждаются
    на экране ConsentScreen мобилки."""
    user = (
        await session.execute(select(User).where(User.phone == phone))
    ).scalar_one_or_none()
    if user is None:
        user = User(phone=phone, phone_verified=True, role=role)
        session.add(user)
        await session.flush()
        session.add(
            PatientProfile(
                user_id=user.id,
                first_name="Пациент",
                last_name="Не указано",
                phone=phone,
                consent_personal_data=False,
                consent_medical_data=False,
            )
        )
    elif not user.is_active:
        raise unauthorized("Учётная запись заблокирована")
    else:
        user.phone_verified = True
        profile = (
            await session.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))
        ).scalar_one_or_none()
        if profile is None:
            session.add(
                PatientProfile(
                    user_id=user.id,
                    first_name="Пациент",
                    last_name="Не указано",
                    phone=phone,
                    consent_personal_data=False,
                    consent_medical_data=False,
                )
            )
    await audit_service.record(
        session,
        user_id=user.id,
        action="auth.sms_verify",
        entity_type="User",
        entity_id=user.id,
        new_values={"phone": phone},
    )
    return await _login_success(session, user)


async def _login_success(session: AsyncSession, user: User) -> tuple[User, TokenPair]:
    tokens = await _issue_tokens(session, user)
    user.last_login_at = utcnow()
    await audit_service.record(
        session,
        user_id=user.id,
        action="auth.login",
        entity_type="User",
        entity_id=user.id,
    )
    await session.commit()
    return user, tokens


async def refresh(session: AsyncSession, *, refresh_token: str) -> TokenPair:
    """Refresh с rotation. Повторное использование отозванного токена —
    признак компрометации: отзываем ВСЕ сессии пользователя (AUTH_PLAN.md §2)."""
    try:
        payload = jwt_service.decode_token(refresh_token, expected_type="refresh")
    except (ValueError, ApiError):
        import logging
        logging.getLogger(__name__).warning('invalid refresh token decode')
        raise unauthorized("Недействительный refresh-токен") from None

    user = (
        await session.execute(select(User).where(User.id == uuid.UUID(payload.sub)))
    ).scalar_one_or_none()
    if user is None or not user.is_active:
        raise unauthorized("Недействительный refresh-токен")

    row = (
        await session.execute(
            select(RefreshToken).where(RefreshToken.token_hash == _token_hash(refresh_token))
        )
    ).scalar_one_or_none()
    if row is None:
        raise unauthorized("Недействительный refresh-токен")

    if row.revoked_at is not None:
        # Компрометация: токен уже использован — отзываем все сессии
        await revoke_all(session, user_id=user.id, action="auth.revoke_all")
        await session.commit()
        raise unauthorized("Сессия отозвана, требуется повторный вход")

    if payload.token_version != user.token_version:
        raise unauthorized("Сессия отозвана, требуется повторный вход")

    # Rotation: старый токен — отозван, выдаём новую пару
    row.revoked_at = utcnow()
    tokens = await _issue_tokens(session, user)
    await audit_service.record(
        session,
        user_id=user.id,
        action="auth.refresh",
        entity_type="User",
        entity_id=user.id,
    )
    await session.commit()
    return tokens


async def revoke_all(session: AsyncSession, *, user_id: uuid.UUID, action: str) -> int:
    """Отозвать все активные refresh-токены пользователя."""
    result = await session.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=utcnow())
    )
    # Инкремент token_version делает невалидными все ранее выданные refresh-токены
    await session.execute(
        update(User).where(User.id == user_id).values(token_version=User.token_version + 1)
    )
    await audit_service.record(
        session,
        user_id=user_id,
        action=action,
        entity_type="User",
        entity_id=user_id,
    )
    return result.rowcount or 0  # type: ignore[attr-defined]


async def logout(
    session: AsyncSession, *, user_id: uuid.UUID, refresh_token: str | None
) -> None:
    """Выход: отзыв переданного refresh-токена (или всех, если не передан)."""
    if refresh_token:
        await session.execute(
            update(RefreshToken)
            .where(
                RefreshToken.user_id == user_id,
                RefreshToken.token_hash == _token_hash(refresh_token),
                RefreshToken.revoked_at.is_(None),
            )
            .values(revoked_at=datetime.now(UTC))
        )
    else:
        await revoke_all(session, user_id=user_id, action="auth.logout")
    await audit_service.record(
        session,
        user_id=user_id,
        action="auth.logout",
        entity_type="User",
        entity_id=user_id,
    )
    await session.commit()


async def store_consent(
    session: AsyncSession,
    *,
    user: User,
    consent_personal_data: bool,
    consent_medical_data: bool,
    consent_data_sharing_with_doctor: bool = False,
) -> dict:
    """Persist 152-ФЗ consents for the current patient profile."""
    profile = (
        await session.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))
    ).scalar_one_or_none()
    if profile is None:
        raise not_found("Профиль пациента не найден")
    profile.consent_personal_data = consent_personal_data
    profile.consent_medical_data = consent_medical_data
    profile.consent_data_sharing_with_doctor = consent_data_sharing_with_doctor
    profile.consent_data_processing_at = utcnow()
    await audit_service.record(
        session,
        user_id=user.id,
        action="auth.consent",
        entity_type="PatientProfile",
        entity_id=profile.id,
        new_values={
            "consent_personal_data": consent_personal_data,
            "consent_medical_data": consent_medical_data,
            "consent_data_sharing_with_doctor": consent_data_sharing_with_doctor,
        },
    )
    await session.commit()
    await session.refresh(profile)
    _consent_at = profile.consent_data_processing_at
    return {
        "consent_personal_data": profile.consent_personal_data,
        "consent_medical_data": profile.consent_medical_data,
        "consent_data_sharing_with_doctor": profile.consent_data_sharing_with_doctor,
        "consent_data_processing_at": (_consent_at.isoformat() if _consent_at is not None else None),
    }

async def change_password(
    session: AsyncSession, *, user: User, current_password: str, new_password: str
) -> None:
    """Смена пароля (только для email+пароль аккаунтов). После смены —
    отзыв всех остальных сессий."""
    if not user.password_hash or not verify_password(user.password_hash, current_password):
        raise invalid_credentials("Некорректный текущий пароль")
    user.password_hash = hash_password(new_password)
    await audit_service.record(
        session,
        user_id=user.id,
        action="auth.password_change",
        entity_type="User",
        entity_id=user.id,
    )
    await revoke_all(session, user_id=user.id, action="auth.revoke_all")
    await session.commit()

