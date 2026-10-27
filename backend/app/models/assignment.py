"""Привязка пациента к врачу (DB_SCHEMA.md §1 patient_assignments)."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPkMixin


class PatientAssignment(UUIDPkMixin, Base):
    __tablename__ = "patient_assignments"
    __table_args__ = (
        UniqueConstraint(
            "patient_id", "practitioner_id", "clinic_id", name="uq_patient_assignment"
        ),
        Index("idx_patient_assignments_patient_id", "patient_id"),
        Index("idx_patient_assignments_practitioner_id", "practitioner_id"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    practitioner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("practitioner_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<PatientAssignment patient={self.patient_id} practitioner={self.practitioner_id}>"
