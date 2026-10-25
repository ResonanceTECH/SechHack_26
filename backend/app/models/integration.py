"""Integration event log for universal API connector (MIS / emergency services).

Stores outbound/inbound integration events with idempotency, retry state and
payloads. This is the persistence backbone for adapters.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPkMixin


class IntegrationEvent(UUIDPkMixin, Base):
    __tablename__ = "integration_events"
    __table_args__ = (
        Index("idx_integration_events_status_created_at", "status", "created_at"),
        Index("idx_integration_events_idempotency_key", "idempotency_key", unique=True),
        Index("idx_integration_events_target_system", "target_system"),
    )

    source_system: Mapped[str] = mapped_column(String(50), nullable=False)
    target_system: Mapped[str] = mapped_column(String(50), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    idempotency_key: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    response: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    next_retry_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<IntegrationEvent {self.event_type} {self.target_system} {self.status}>"