"""Trend snapshot storage for time-series analytics (Этап 9)."""
from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPkMixin


class TrendSnapshot(UUIDPkMixin, Base):
    """Stored (materialized) trend aggregate for a patient/questionnaire over a window."""

    __tablename__ = "trend_snapshots"
    __table_args__ = (
        Index("idx_trend_snapshots_patient_code_period", "patient_id", "questionnaire_code", "period", "window_start"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    questionnaire_code: Mapped[str] = mapped_column(String(50), nullable=False)
    period: Mapped[str] = mapped_column(String(20), nullable=False, default="weekly", server_default="weekly")
    window_start: Mapped[date] = mapped_column(nullable=False)
    window_end: Mapped[date] = mapped_column(nullable=False)
    avg_score: Mapped[float | None] = mapped_column(Float)
    min_score: Mapped[int | None] = mapped_column(Integer)
    max_score: Mapped[int | None] = mapped_column(Integer)
    trend_direction: Mapped[str | None] = mapped_column(String(20))
    computed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now(), nullable=False
    )
    data: Mapped[dict | None] = mapped_column(JSONB)
