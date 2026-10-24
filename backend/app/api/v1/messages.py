"""Messages API endpoints."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.common import EnvelopeResponse
from app.schemas.message import MessageCreate, MessageResponse
from app.services.message_service import MessageService
from app.repositories.message_repository import MessageRepository


messages_router = APIRouter(prefix="/api/v1/messages", tags=["messages"])


def _svc() -> MessageService:
    return MessageService(MessageRepository())


@messages_router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                     dependencies=[Depends(require_permission("message:read"))])
async def list_messages(request: Request, current_user: CurrentUser, db: DbSession, patient_id: Optional[str] = None):
    svc = _svc()
    items = await svc.list_messages(db, current_user, patient_id)
    data = [MessageResponse.model_validate(m).model_dump() for m in items]
    return {"data": {"items": data, "total": len(data)}, "request_id": getattr(request.state, "request_id", "")}


@messages_router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
                      dependencies=[Depends(require_permission("message:read"))])
async def create_message(body: MessageCreate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.create_message(db, current_user, body.model_dump())
    return {"data": MessageResponse.model_validate(row).model_dump(), "request_id": getattr(request.state, "request_id", "")}


@messages_router.patch("/{message_id}/read", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                      dependencies=[Depends(require_permission("message:read"))])
async def mark_read(message_id: str, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.mark_read(db, message_id)
    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Message not found")
    return {"data": MessageResponse.model_validate(row).model_dump(), "request_id": getattr(request.state, "request_id", "")}