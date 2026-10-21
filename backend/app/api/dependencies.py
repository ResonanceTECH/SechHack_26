"""FastAPI-зависимости: аутентификация (JWT) и авторизация (RBAC)."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import forbidden, unauthorized
from app.core.permissions import has_permission
from app.core.security import jwt as jwt_service
from app.db.session import get_db
from app.models.profile import PatientProfile
from app.models.user import User

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    db: DbSession, authorization: Annotated[str | None, Header()] = None
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
