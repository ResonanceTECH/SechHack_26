"""Клиника (DB_SCHEMA.md §1 clinics)."""

from __future__ import annotations

from sqlalchemy import Boolean, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class Clinic(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "clinics"
    __table_args__ = (Index("idx_clinics_name", "name"),)

    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str | None] = mapped_column(Text)
    inn: Mapped[str | None] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    def __repr__(self) -> str:
        return f"<Clinic {self.id} {self.name!r}>"
