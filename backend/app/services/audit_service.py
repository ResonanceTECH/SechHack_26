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

from app.models.audit import AuditLog, AuditEvent

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
        "assessment_plan.create",
        "assessment_plan.update",
        "assessment_plan.delete",
        "schedule.update",
        "schedule.exception_create",
        "schedule.exception_delete",
        "clinic_settings.update",
        "medication_adherence.update",
        "patient_assignment.create",
        "patient_assignment.deactivate",
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


async def record_security_event(
    session: AsyncSession,
    *,
    action: str,
    resource_type: str,
    result: str = "denied",
    user_id: uuid.UUID | None = None,
    user_role: str | None = None,
    clinic_id: uuid.UUID | None = None,
    patient_id: uuid.UUID | None = None,
    resource_id: str | None = None,
    request_id: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    details: dict[str, Any] | None = None,
    commit: bool = False,
) -> None:
    session.add(
        AuditEvent(
            actor_user_id=user_id,
            actor_role=user_role,
            clinic_id=clinic_id,
            patient_id=patient_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            result=result,
            request_id=request_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
        )
    )
    if commit:
        await session.commit()
