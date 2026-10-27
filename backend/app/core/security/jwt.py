"""JWT access/refresh токены — HS256 (AUTH_PLAN.md §2).

Access:  sub, role, clinic_id, jti, type=access, exp, iat
Refresh: sub, jti, type=refresh, exp, iat, token_version
Отзыв refresh — через refresh_tokens + users.token_version (rotation).
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt

from app.core.config import get_settings
from app.core.errors import unauthorized

TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"


class TokenPayload(dict):
    """Утончённый dict с подсказками по ключам (без магии)."""

    @property
    def sub(self) -> str:
        return str(self["sub"])

    @property
    def role(self) -> str | None:
        return self.get("role")

    @property
    def token_type(self) -> str:
        return str(self["type"])

    @property
    def jti(self) -> str:
        return str(self["jti"])

    @property
    def token_version(self) -> int | None:
        return self.get("token_version")


def _encode(claims: dict[str, Any]) -> str:
    settings = get_settings()
    return jwt.encode(claims, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(
    *, user_id: uuid.UUID, role: str, clinic_id: uuid.UUID | None = None
) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    claims = {
        "sub": str(user_id),
        "role": role,
        "clinic_id": str(clinic_id) if clinic_id else None,
        "jti": str(uuid.uuid4()),
        "type": TOKEN_TYPE_ACCESS,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return _encode(claims)


def create_refresh_token(*, user_id: uuid.UUID, token_version: int) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    claims = {
        "sub": str(user_id),
        "jti": str(uuid.uuid4()),
        "type": TOKEN_TYPE_REFRESH,
        "token_version": token_version,
        "iat": now,
        "exp": now + timedelta(days=settings.refresh_token_expire_days),
    }
    return _encode(claims)


def decode_token(token: str, *, expected_type: str) -> TokenPayload:
    """Раскодировать и провалидировать JWT. Любая ошибка → 401 unauthorized."""
    settings = get_settings()
    try:
        claims = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except jwt.PyJWTError:
        raise unauthorized("Недействительный или просроченный токен") from None
    payload = TokenPayload(claims)
    if payload.token_type != expected_type:
        raise unauthorized("Недействительный тип токена")
    return payload
