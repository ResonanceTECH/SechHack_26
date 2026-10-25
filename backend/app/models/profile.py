"""Профили пациента и специалиста (DB_SCHEMA.md §1 patient_profiles,
practitioner_profiles)."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin

GENDER_VALUES = "('male','female','other','prefer_not_to_say')"
SPECIALIZATION_VALUES = "('psychiatrist','psychotherapist','psychologist','nurse','registrar')"


class PatientProfile(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "patient_profiles"
    __table_args__ = (
        CheckConstraint(f"gender IN {GENDER_VALUES}", name="ck_patient_profiles_gender"),
        Index("idx_patient_profiles_clinic_id", "clinic_id"),
        Index("idx_patient_profiles_user_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    middle_name: Mapped[str | None] = mapped_column(String(100))
    birth_date: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[str | None] = mapped_column(String(30))
    phone: Mapped[str | None] = mapped_column(String(30))
    # 152-ФЗ: согласия обязательны (NOT NULL), факт времени фиксируем отдельно
    consent_personal_data: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )
    consent_medical_data: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )
    consent_data_processing_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    clinic_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id")
    )

    def __repr__(self) -> str:
        return f"<PatientProfile {self.id} {self.last_name} {self.first_name}>"


class PractitionerProfile(UUIDPkMixin, Base):
    """Без updated_at — DDL не содержит updated_at для этой таблицы."""

    __tablename__ = "practitioner_profiles"
    __table_args__ = (
        CheckConstraint(
            f"specialization IN {SPECIALIZATION_VALUES}",
            name="ck_practitioner_profiles_specialization",
        ),
        Index("idx_practitioner_profiles_clinic_id", "clinic_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    middle_name: Mapped[str | None] = mapped_column(String(100))
    specialization: Mapped[str] = mapped_column(String(50), nullable=False)
    license_number: Mapped[str | None] = mapped_column(String(100))
    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )


class PractitionerNameHistory(UUIDPkMixin, Base):
    """Strict clinical history: practitioner name changes."""

    __tablename__ = "practitioner_name_history"
    __table_args__ = (
        Index("idx_practitioner_name_history_practitioner_id", "practitioner_id"),
        Index("idx_practitioner_name_history_changed_at", "changed_at"),
    )

    practitioner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False
    )
    changed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now(), nullable=False
    )
    reason: Mapped[str | None] = mapped_column(Text)
    effective_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    effective_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    old_first_name: Mapped[str | None] = mapped_column(String(100))
    old_last_name: Mapped[str | None] = mapped_column(String(100))
    old_middle_name: Mapped[str | None] = mapped_column(String(100))
    new_first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    new_last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    new_middle_name: Mapped[str | None] = mapped_column(String(100))
class PatientNameHistory(UUIDPkMixin, Base):
    """Strict clinical history: patient name changes."""

    __tablename__ = "patient_name_history"
    __table_args__ = (
        Index("idx_patient_name_history_patient_id", "patient_id"),
        Index("idx_patient_name_history_changed_at", "changed_at"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    changed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now(), nullable=False
    )
    reason: Mapped[str | None] = mapped_column(Text)
    effective_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    effective_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    old_first_name: Mapped[str | None] = mapped_column(String(100))
    old_last_name: Mapped[str | None] = mapped_column(String(100))
    old_middle_name: Mapped[str | None] = mapped_column(String(100))
    new_first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    new_last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    new_middle_name: Mapped[str | None] = mapped_column(String(100))
