"""Клинические модели concept01, ч.1: скрининги и дневник (DB_SCHEMA.md §1).

Файл новый (Этап Б): существующие файлы не изменяются.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPkMixin


class ScreeningResult(UUIDPkMixin, Base):
    """Результат скрининга PHQ-9 / GAD-7 (server-side подсчёт)."""

    __tablename__ = "screening_results"
    __table_args__ = (
        CheckConstraint("score >= 0", name="ck_screening_results_score_nonneg"),
        CheckConstraint(
            "(questionnaire_type = 'phq9' AND score <= 27) OR "
            "(questionnaire_type = 'gad7' AND score <= 21) OR "
            "(questionnaire_type = 'ymrs' AND score <= 60) OR "
            "(questionnaire_type = 'hcl8' AND score <= 8) OR "
            "(questionnaire_type = 'pdss' AND score <= 28) OR "
            "(questionnaire_type = 'cssrs' AND score <= 6) OR "
            "(questionnaire_type = 'isi' AND score <= 28) OR "
            "(questionnaire_type = 'hcl33' AND score <= 33)",
            name="chk_screening_score_range",
        ),
        Index("idx_screening_results_patient_id_created_at", "patient_id", "created_at"),
        Index("idx_screening_results_is_critical", "is_critical"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    questionnaire_type: Mapped[str] = mapped_column(String(20), nullable=False)
    questionnaire_version: Mapped[str] = mapped_column(String(50), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    answers: Mapped[dict | None] = mapped_column(JSONB)
    is_critical: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    severity: Mapped[str | None] = mapped_column(String(255), nullable=True)
    critical_reason: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )


class DiaryEntry(UUIDPkMixin, Base):
    """Запись дневника (офлайн-синхронизация через device_id/recorded_at)."""

    __tablename__ = "diary_entries"
    __table_args__ = (
        CheckConstraint("mood_score IS NULL OR mood_score BETWEEN -3 AND 3", name="ck_diary_entries_mood_score"),
        CheckConstraint("anxiety_score IS NULL OR anxiety_score BETWEEN 0 AND 4", name="ck_diary_entries_anxiety_score"),
        CheckConstraint("energy_score IS NULL OR energy_score BETWEEN 0 AND 4", name="ck_diary_entries_energy_score"),
        CheckConstraint("functioning_score IS NULL OR functioning_score BETWEEN 0 AND 4", name="ck_diary_entries_functioning_score"),
        Index("uq_diary_entries_device_recorded_patient", "device_id", "recorded_at", "patient_id", unique=True, postgresql_where="device_id IS NOT NULL"),
        Index("idx_diary_entries_patient_id_recorded_at", "patient_id", "recorded_at"),
        Index("idx_diary_entries_synced_at", "synced_at"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    mood_score: Mapped[int | None] = mapped_column(Integer)
    anxiety_score: Mapped[int | None] = mapped_column(Integer)
    energy_score: Mapped[int | None] = mapped_column(Integer)
    functioning_score: Mapped[int | None] = mapped_column(Integer)
    sleep_hours: Mapped[float | None] = mapped_column()
    sleep_quality: Mapped[int | None] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(Text)
    device_id: Mapped[str | None] = mapped_column(String(100))
    synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now(), onupdate=func.now()
    )
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    edited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    edited_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    edit_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    corrected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    corrected_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    correction_reason: Mapped[str | None] = mapped_column(Text)
class DiaryEntryVersion(UUIDPkMixin, Base):
    """Strict clinical history: diary entry versions/addenda."""

    __tablename__ = "diary_entry_versions"
    __table_args__ = (
        Index("idx_diary_entry_versions_entry_id", "diary_entry_id"),
        Index("idx_diary_entry_versions_changed_at", "changed_at"),
    )

    diary_entry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("diary_entries.id", ondelete="CASCADE"), nullable=False
    )
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
