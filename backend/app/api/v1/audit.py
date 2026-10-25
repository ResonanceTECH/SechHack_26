"""Audit log API."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.models.audit import AuditLog
from app.schemas.common import EnvelopeResponse


audit_router = APIRouter(prefix="/api/v1/audit", tags=["audit"])


@audit_router.get(
    "/logs",
    status_code=status.HTTP_200_OK,
    response_model=EnvelopeResponse,
    dependencies=[Depends(require_permission("audit:read"))],
)
async def list_audit_logs(request: Request, current_user: CurrentUser, db: DbSession):
    rows = (await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(100))).scalars().all()
    data = [
        {
            "id": str(r.id),
            "user_id": str(r.user_id) if r.user_id else None,
            "action": r.action,
            "entity_type": r.entity_type,
            "entity_id": str(r.entity_id),
            "old_values": r.old_values,
            "new_values": r.new_values,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}
