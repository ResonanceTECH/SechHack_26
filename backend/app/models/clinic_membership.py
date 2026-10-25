"""Multi-clinic membership for practitioners."""

from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class PractitionerClinicMembership(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "practitioner_clinic_memberships"
    __table_args__ = (
        Index("idx_practitioner_clinic_memberships_practitioner_id", "practitioner_id"),
        Index("idx_practitioner_clinic_memberships_clinic_id", "clinic_id"),
    )

    practitioner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"), nullable=False
    )
    role_in_clinic: Mapped[str | None] = mapped_column(String(50))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)

    def __repr__(self) -> str:
        return f"<PractitionerClinicMembership {self.practitioner_id} {self.clinic_id}>"