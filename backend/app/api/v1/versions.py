from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.core.errors import validation_error
from app.schemas.common import EnvelopeResponse
from app.schemas.version import VersionCreateRequest, VersionResponse
from app.services.version_service import EntityVersionService

router = APIRouter(prefix="/api/v1/versions", tags=["versions"])
_svc = EntityVersionService()


def _to_response(row) -> dict:
    return VersionResponse(
        id=str(row.id),
        entity_type=row.entity_type,
        entity_id=str(row.entity_id),
        version_number=row.version_number,
        changed_by=str(row.changed_by) if row.changed_by else None,
        changed_at=row.changed_at.isoformat() if row.changed_at else None,
        reason=row.reason,
        is_addendum=row.is_addendum,
        snapshot=row.snapshot or {},
    ).model_dump()


@router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("diary:read"))])
async def list_versions(request: Request, current_user: CurrentUser, db: DbSession,
                        entity_type: str = Query(...), entity_id: str = Query(...)) -> dict:
    rows = await _svc.list_versions(db, entity_type, entity_id)
    return {"data": [_to_response(r) for r in rows],
            "request_id": getattr(request.state, "request_id", "")}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
             dependencies=[Depends(require_permission("diary:read"))])
async def create_version(body: VersionCreateRequest, request: Request,
                        current_user: CurrentUser, db: DbSession) -> dict:
    if not body.entity_type or not body.entity_id:
        raise validation_error("entity_type и entity_id обязательны")
    row = await _svc.record(
        db, entity_type=body.entity_type, entity_id=body.entity_id,
        changed_by=str(current_user.id), reason=body.reason,
        is_addendum=body.is_addendum, snapshot=body.snapshot,
    )
    return {"data": _to_response(row), "request_id": getattr(request.state, "request_id", "")}