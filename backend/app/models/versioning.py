"""Universal entity versioning / addendum model (Этап 13)."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPkMixin


class EntityVersion(UUIDPkMixin, Base):
    """Universal version snapshot for any clinical entity (medication, care_plan, screening, ...)."""

    __tablename__ = "entity_versions"
    __table_args__ = (
        Index("idx_entity_versions_entity", "entity_type", "entity_id"),
        Index("idx_entity_versions_changed_at", "changed_at"),
    )

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")
    changed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now(), nullable=False
    )
    reason: Mapped[str | None] = mapped_column(Text)
    is_addendum: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
