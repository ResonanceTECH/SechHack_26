"""Декларативный Base для всех моделей SQLAlchemy 2.0 (Mapped/typed)."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    """Наиболее актуальный now() для серверных/клиентских значений."""
    return datetime.now(UTC)


class Base(DeclarativeBase):
    """Базовый класс ORM. Общие колонки — через миксины ниже."""


class UUIDPkMixin:
    """id UUID PK с серверным default (uuid_generate_v4 из расширения pgcrypto)."""

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.uuid_generate_v4(),
    )


class TimestampMixin:
    """created_at/updated_at TIMESTAMPTZ DEFAULT NOW()."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now(), onupdate=utcnow
    )
