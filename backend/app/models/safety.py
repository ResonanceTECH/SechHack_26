"""SafetyPlan and CrisisSignal models."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class SafetyPlan(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "safety_plans"

    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    practitioner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("practitioner_profiles.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    warning_signs: Mapped[str | None] = mapped_column(Text, nullable=True)
    internal_coping_strategies: Mapped[str | None] = mapped_column(Text, nullable=True)
    social_contacts: Mapped[str | None] = mapped_column(Text, nullable=True)
    family_support: Mapped[str | None] = mapped_column(Text, nullable=True)
    professional_contacts: Mapped[str | None] = mapped_column(Text, nullable=True)
    emergency_contacts: Mapped[str | None] = mapped_column(Text, nullable=True)
    safe_environment: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    review_date: Mapped[object | None] = mapped_column(Date, nullable=True)


class CrisisSignal(UUIDPkMixin, Base):
    __tablename__ = "crisis_signals"

    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    triggered_by_screening_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("screening_results.id"), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="new")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="critical")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    acknowledged_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
