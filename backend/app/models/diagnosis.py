"""???????? ????????."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class PatientDiagnosis(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "patient_diagnoses"
    __table_args__ = (
        CheckConstraint("coding_system IN ('ICD10','ICD11')", name="ck_patient_diagnoses_coding_system"),
        CheckConstraint("status IN ('active','remission','resolved','closed')", name="ck_patient_diagnoses_status"),
        Index("idx_patient_diagnoses_patient_id", "patient_id"),
        Index("idx_patient_diagnoses_status", "status"),
        Index("uq_patient_diagnoses_primary_active", "patient_id", unique=True, postgresql_where="is_primary = true AND status = 'active'"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    coding_system: Mapped[str] = mapped_column(String(10), nullable=False)
    code: Mapped[str] = mapped_column(String(30), nullable=False)
    title: Mapped[str | None] = mapped_column(String(255))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    status: Mapped[str] = mapped_column(String(20), default="active", server_default="active")
    diagnosed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=None, server_default=func.now(), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    diagnosed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    is_confirmed: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    notes: Mapped[str | None] = mapped_column(Text)

from sqlalchemy import UniqueConstraint


class DiagnosisReference(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "diagnosis_references"
    __table_args__ = (
        CheckConstraint("coding_system IN ('ICD10','ICD11')", name="ck_diagnosis_references_coding_system"),
        UniqueConstraint("coding_system", "code", name="uq_diagnosis_references_coding_system_code"),
        Index("idx_diagnosis_references_coding_system", "coding_system"),
        Index("idx_diagnosis_references_code", "code"),
    )

    coding_system: Mapped[str] = mapped_column(String(10), nullable=False)
    code: Mapped[str] = mapped_column(String(30), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    title_en: Mapped[str | None] = mapped_column(String(255))
    chapter: Mapped[str | None] = mapped_column(String(255))
    parent_code: Mapped[str | None] = mapped_column(String(30))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    version: Mapped[str | None] = mapped_column(String(50))
