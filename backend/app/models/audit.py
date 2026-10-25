"""Журнал аудита (DB_SCHEMA.md §1 audit_logs).

В old_values/new_values никогда не пишутся пароли и токены — whitelist
полей в audit_service (AUTH_PLAN.md §6).
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPkMixin


class AuditLog(UUIDPkMixin, Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("idx_audit_logs_user_id_created_at", "user_id", "created_at"),
        Index("idx_audit_logs_entity_type_entity_id", "entity_type", "entity_id"),
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    old_values: Mapped[dict | None] = mapped_column(JSONB)
    new_values: Mapped[dict | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} {self.entity_type}:{self.entity_id}>"


class AuditEvent(UUIDPkMixin, Base):
    __tablename__ = "audit_events"
    __table_args__ = (
        Index("idx_audit_events_occurred_at", "occurred_at"),
        Index("idx_audit_events_actor_user_id", "actor_user_id"),
        Index("idx_audit_events_clinic_id", "clinic_id"),
        Index("idx_audit_events_patient_id", "patient_id"),
        Index("idx_audit_events_result", "result"),
    )

    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    actor_role: Mapped[str | None] = mapped_column(String(50))
    clinic_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="SET NULL")
    )
    patient_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="SET NULL")
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(255))
    result: Mapped[str] = mapped_column(String(30), nullable=False, server_default="allowed")
    request_id: Mapped[str | None] = mapped_column(String(100))
    ip_address: Mapped[str | None] = mapped_column(String(64))
    user_agent: Mapped[str | None] = mapped_column(Text)
    details: Mapped[dict | None] = mapped_column(JSONB)

    def __repr__(self) -> str:
        return f"<AuditEvent {self.action} {self.resource_type}:{self.resource_id} {self.result}>"