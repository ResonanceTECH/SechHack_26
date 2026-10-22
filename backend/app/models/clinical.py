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
            "(questionnaire_type = 'gad7' AND score <= 21)",
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
        CheckConstraint("mood_score BETWEEN 1 AND 5", name="ck_diary_entries_mood_score"),
        CheckConstraint("anxiety_score BETWEEN 1 AND 5", name="ck_diary_entries_anxiety_score"),
        CheckConstraint("energy_score BETWEEN 1 AND 5", name="ck_diary_entries_energy_score"),
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
    sleep_hours: Mapped[float | None] = mapped_column()
    sleep_quality: Mapped[int | None] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(Text)
    device_id: Mapped[str | None] = mapped_column(String(100))
    synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )
