from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class IntegrationEventCreate(BaseModel):
    source_system: str = Field(..., max_length=50)
    target_system: str = Field(..., max_length=50)
    event_type: str = Field(..., max_length=100)
    entity_type: str = Field(..., max_length=50)
    entity_id: Optional[str] = None
    idempotency_key: str = Field(..., max_length=128)
    payload: dict[str, Any] = Field(default_factory=dict)


class IntegrationEventResponse(BaseModel):
    id: str
    source_system: str
    target_system: str
    event_type: str
    entity_type: str
    entity_id: Optional[str] = None
    idempotency_key: str
    status: str
    payload: dict[str, Any]
    response: Optional[dict[str, Any]] = None
    retry_count: int
    next_retry_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class WebhookReceiveRequest(BaseModel):
    event_type: str
    entity_type: str
    entity_id: Optional[str] = None
    idempotency_key: Optional[str] = None
    payload: dict[str, Any] = Field(default_factory=dict)