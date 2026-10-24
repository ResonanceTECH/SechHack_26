"""Medications and prescriptions (rx)."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class Medication(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "medications"
    __table_args__ = (
        Index("idx_medications_name", "name"),
        Index("idx_medications_international_name", "international_name"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    international_name: Mapped[str | None] = mapped_column(String(255))
    dosage_form: Mapped[str | None] = mapped_column(String(100))
    strength: Mapped[str | None] = mapped_column(String(100))
    manufacturer: Mapped[str | None] = mapped_column(String(255))
    instructions_url: Mapped[str | None] = mapped_column(String(500))
    contraindications: Mapped[str | None] = mapped_column(Text)
    side_effects: Mapped[str | None] = mapped_column(Text)
    interactions: Mapped[str | None] = mapped_column(Text)
    patient_instruction: Mapped[str | None] = mapped_column(Text)


class Prescription(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "prescriptions"
    __table_args__ = (
        CheckConstraint("end_date >= start_date", name="ck_prescriptions_dates"),
        Index("idx_prescriptions_patient_id", "patient_id"),
        Index("idx_prescriptions_practitioner_id", "practitioner_id"),
        Index("idx_prescriptions_medication_id", "medication_id"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    practitioner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False
    )
    medication_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("medications.id", ondelete="CASCADE"), nullable=False
    )
    dosage: Mapped[str] = mapped_column(String(100), nullable=False)
    frequency: Mapped[str] = mapped_column(String(255), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")


class MedicationAdherence(UUIDPkMixin, Base):
    __tablename__ = "medication_adherence"
    __table_args__ = (
        UniqueConstraint("prescription_id", "taken_at", name="uq_medication_adherence_prescription_taken"),
        Index("idx_medication_adherence_prescription_id", "prescription_id"),
    )

    prescription_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False
    )
    taken_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_taken: Mapped[bool] = mapped_column(Boolean, nullable=False)
    note: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now(), onupdate=func.now()
    )
    corrected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    corrected_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    correction_reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )
