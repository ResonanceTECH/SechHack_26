"""Assessment plan model for Measurement Based Care."""

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
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class AssessmentPlan(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "assessment_plans"
    __table_args__ = (
        CheckConstraint("interval_days > 0", name="ck_assessment_plans_interval_days"),
        Index("idx_assessment_plans_patient_id", "patient_id"),
        Index("idx_assessment_plans_diagnosis_id", "diagnosis_id"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    diagnosis_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_diagnoses.id", ondelete="SET NULL")
    )
    questionnaire_code: Mapped[str] = mapped_column(String(50), nullable=False)
    interval_days: Mapped[int] = mapped_column(Integer, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
