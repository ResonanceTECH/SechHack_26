"""Запись событий в audit_logs (AUTH_PLAN.md §6).

Whitelist: в old_values/new_values не должны попасть пароли, хеши и токены —
фильтруем по списку запрещённых ключей независимо от того, что передал
вызывающий код.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog

logger = logging.getLogger("app.audit")

_FORBIDDEN_SUBSTRINGS = ("password", "token", "secret", "code_hash", "authorization")

KNOWN_ACTIONS = frozenset(
    {
        "auth.register",
        "auth.login",
        "auth.logout",
        "auth.refresh",
        "auth.revoke_all",
        "auth.password_change",
        "auth.sms_verify",
        "invite.verify",
        "patient.read",
        "patient.update",
        "prescription.create",
        "prescription.update",
        "alert.resolve",
        "alert.created",
        "alert.dismiss",
        "alert.updated",
        "employee.role_change",
    }
)


def _sanitize(values: dict[str, Any] | None) -> dict[str, Any] | None:
    if not values:
        return None
    return {
        k: v
        for k, v in values.items()
        if not any(bad in k.lower() for bad in _FORBIDDEN_SUBSTRINGS)
    }


async def record(
    session: AsyncSession,
    *,
    user_id: uuid.UUID | None,
    action: str,
    entity_type: str,
    entity_id: uuid.UUID,
    old_values: dict[str, Any] | None = None,
    new_values: dict[str, Any] | None = None,
    commit: bool = False,
) -> None:
    if action not in KNOWN_ACTIONS:
        logger.warning("Неизвестный тип действия аудита: %s", action)
    session.add(
        AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=_sanitize(old_values),
            new_values=_sanitize(new_values),
        )
    )
    if commit:
        await session.commit()
