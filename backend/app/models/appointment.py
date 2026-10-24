"""Appointments (записи на приём)."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class Appointment(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "appointments"
    __table_args__ = (
        CheckConstraint(
            "status IN ('scheduled','completed','cancelled','no_show')",
            name="ck_appointments_status",
        ),
        Index("idx_appointments_patient_id_scheduled_at", "patient_id", "scheduled_at"),
        Index("idx_appointments_practitioner_id_scheduled_at", "practitioner_id", "scheduled_at"),
        Index("idx_appointments_status", "status"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    practitioner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False
    )
    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=False
    )
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="scheduled", server_default="scheduled")
    reason: Mapped[str | None] = mapped_column(Text)