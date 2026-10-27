"""FastAPI-зависимости: аутентификация (JWT) и авторизация (RBAC)."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends, Header, Request
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import forbidden, unauthorized
from app.core.permissions import has_permission
from app.core.security import jwt as jwt_service
from app.db.session import get_db
from app.models.profile import PatientProfile
from app.models.user import User

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    request: Request,
    db: DbSession,
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    """Извлечь пользователя из Bearer access-токена. Проверяется только
    access: его отзыв неявный (по exp), 15 минут — окно реагирования."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise unauthorized()
    token = authorization.removeprefix("Bearer ").strip()
    payload = jwt_service.decode_token(token, expected_type="access")
    user = (
        await db.execute(select(User).where(User.id == uuid.UUID(payload.sub)))
    ).scalar_one_or_none()
    if user is None or not user.is_active:
        raise unauthorized("Учётная запись не найдена или заблокирована")

    # RLS context: ограничиваем SQL-запросы текущей клиникой пользователя.
    # Для multi-clinic practitioner контекст не выставляем (RLS остается пермиссивным,
    # изоляция обеспечивается application-level проверками).
    clinic_ids: list[str] = []
    try:
        if user.role in ("doctor", "psychologist", "coordinator", "clinic_admin"):
            from app.services.clinic_isolation import practitioner_clinic_ids

            clinic_ids = await practitioner_clinic_ids(db, user)
        elif user.role == "patient":
            from app.models.profile import PatientProfile

            prof = (
                await db.execute(
                    select(PatientProfile).where(PatientProfile.user_id == user.id)
                )
            ).scalar_one_or_none()
            if prof is not None and prof.clinic_id is not None:
                clinic_ids = [str(prof.clinic_id)]
        if clinic_ids:
            await db.execute(
                text("SELECT set_config('app.current_clinic_ids', :v, true)"),
                {"v": ",".join(clinic_ids)},
            )
            if len(clinic_ids) == 1:
                await db.execute(
                    text("SELECT set_config('app.current_clinic_id', :v, true)"),
                    {"v": clinic_ids[0]},
                )

    except Exception:
        # RLS — дополнительный слой; не ломаем запрос при ошибке контекста
        pass

    # Security audit: successful authenticated access (success-path wiring).
    try:
        from app.services.audit_service import record_security_event

        await record_security_event(
            db,
            action="clinic_isolation.allowed",
            resource_type=request.url.path,
            result="allowed",
            user_id=user.id,
            user_role=user.role,
            clinic_id=uuid.UUID(clinic_ids[0]) if len(clinic_ids) == 1 else None,
            request_id=getattr(request.state, "request_id", None),
        )
    except Exception:
        pass

    request.state.current_user = user
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*roles: str):
    """Зависимость: роль пользователя должна входить в список разрешённых."""

    async def dependency(user: CurrentUser) -> User:
        if user.role not in roles:
            raise forbidden()
        return user

    return dependency


def require_permission(permission: str):
    """Зависимость: право из матрицы RBAC (core/permissions.py)."""

    async def dependency(user: CurrentUser) -> User:
        if not has_permission(user.role, permission):
            raise forbidden()
        return user

    return dependency


async def get_patient_profile(user: User, db: DbSession) -> PatientProfile | None:
    """Профиль пациента текущего пользователя (для self-проверок владельца)."""
    return (
        await db.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))
    ).scalar_one_or_none()
