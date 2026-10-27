from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, DbSession
from app.core.response import ok
from app.repositories.integration_repository import IntegrationRepository
from app.schemas.common import EnvelopeResponse
from app.schemas.integration import IntegrationEventCreate, IntegrationEventResponse, WebhookReceiveRequest

router = APIRouter(prefix="/api/v1/integrations", tags=["integrations"])


def _repo() -> IntegrationRepository:
    return IntegrationRepository()


def _to_response(row) -> dict[str, Any]:
    return IntegrationEventResponse(
        id=str(row.id),
        source_system=row.source_system,
        target_system=row.target_system,
        event_type=row.event_type,
        entity_type=row.entity_type,
        entity_id=str(row.entity_id) if row.entity_id else None,
        idempotency_key=row.idempotency_key,
        status=row.status,
        payload=row.payload or {},
        response=row.response,
        retry_count=row.retry_count,
        next_retry_at=row.next_retry_at,
        created_at=row.created_at,
        updated_at=row.updated_at,
    ).model_dump()


@router.post("/events", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse)
async def create_event(body: IntegrationEventCreate, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    repo = _repo()
    existing = await repo.get_by_idempotency_key(db, body.idempotency_key)
    if existing is not None:
        return {"data": _to_response(existing), "request_id": getattr(request.state, "request_id", "")}

    entity_uuid = None
    if body.entity_id:
        try:
            entity_uuid = uuid.UUID(body.entity_id)
        except ValueError:
            entity_uuid = None

    row = await repo.create(db, {
        "source_system": body.source_system,
        "target_system": body.target_system,
        "event_type": body.event_type,
        "entity_type": body.entity_type,
        "entity_id": entity_uuid,
        "idempotency_key": body.idempotency_key,
        "status": "pending",
        "payload": body.payload,
    })
    return {"data": _to_response(row), "request_id": getattr(request.state, "request_id", "")}


@router.get("/events/{event_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def get_event(event_id: str, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    row = await _repo().get_by_id(db, event_id)
    if row is None:
        from app.core.errors import not_found
        raise not_found("Событие интеграции не найдено")
    return {"data": _to_response(row), "request_id": getattr(request.state, "request_id", "")}


@router.post("/webhooks/{source}", status_code=status.HTTP_202_ACCEPTED, response_model=EnvelopeResponse)
async def receive_webhook(source: str, body: WebhookReceiveRequest, request: Request, db: DbSession) -> dict:
    repo = _repo()
    key = body.idempotency_key or f"webhook:{source}:{body.event_type}:{body.entity_id or 'na'}"
    existing = await repo.get_by_idempotency_key(db, key)
    if existing is not None:
        return {"data": _to_response(existing), "request_id": getattr(request.state, "request_id", "")}

    entity_uuid = None
    if body.entity_id:
        try:
            entity_uuid = uuid.UUID(body.entity_id)
        except ValueError:
            entity_uuid = None

    row = await repo.create(db, {
        "source_system": source,
        "target_system": "clinicalcompass",
        "event_type": body.event_type,
        "entity_type": body.entity_type,
        "entity_id": entity_uuid,
        "idempotency_key": key,
        "status": "received",
        "payload": body.payload,
    })
    return {"data": _to_response(row), "request_id": getattr(request.state, "request_id", "")}


@router.post("/events/{event_id}/deliver", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def deliver_event(event_id: str, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    row = await _repo().get_by_id(db, event_id)
    if row is None:
        from app.core.errors import not_found
        raise not_found("Событие интеграции не найдено")
    from app.services.integration_delivery_service import IntegrationDeliveryService
    updated = await IntegrationDeliveryService().deliver(db, row)
    return {"data": _to_response(updated), "request_id": getattr(request.state, "request_id", "")}


@router.post("/process-pending", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def process_pending(request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    from app.services.integration_delivery_service import IntegrationDeliveryService
    processed = await IntegrationDeliveryService().process_pending(db)
    return {"data": {"processed": processed}, "request_id": getattr(request.state, "request_id", "")}
@router.get("/health", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def integration_health(request: Request) -> dict:
    from app.core.config import get_settings
    from app.integrations.emergency_adapter import EmergencyServiceAdapter
    from app.integrations.mis_adapter import MISAdapter

    settings = get_settings()
    mis = MISAdapter(settings.mis_base_url, settings.mis_api_token)
    emergency = EmergencyServiceAdapter(settings.emergency_base_url, settings.emergency_api_token)
    mis_health = await mis.health_check()
    emergency_health = await emergency.health_check()
    return {"data": {
        "status": "ok",
        "adapters": {
            "mis": {"ok": mis_health.ok, "status_code": mis_health.status_code, "error": mis_health.error},
            "emergency": {"ok": emergency_health.ok, "status_code": emergency_health.status_code, "error": emergency_health.error},
        },
    }, "request_id": getattr(request.state, "request_id", "")}