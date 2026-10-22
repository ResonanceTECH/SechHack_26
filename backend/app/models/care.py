"""Клинические модели concept01, ч.2: программы, упражнения, алерты (DB_SCHEMA.md §1)."""


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
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin

__all__ = [
    "Alert",
    "CarePlan",
    "ExerciseAssignment",
    "ExerciseCompletion",
]


class CarePlan(UUIDPkMixin, TimestampMixin, Base):
    """Программа сопровождения пациента (назначения упражнений/препаратов)."""

    __tablename__ = "care_plans"
    __table_args__ = (
        CheckConstraint("status IN ('active','completed','archived')", name="ck_care_plans_status"),
        Index("idx_care_plans_patient_id", "patient_id"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    practitioner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("practitioner_profiles.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="active", server_default="active")


class ExerciseAssignment(UUIDPkMixin, TimestampMixin, Base):
    """Назначение упражнения в рамках программы."""

    __tablename__ = "exercise_assignments"
    __table_args__ = (Index("idx_exercise_assignments_care_plan_id", "care_plan_id"),)

    care_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("care_plans.id", ondelete="CASCADE"), nullable=False
    )
    exercise_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSONB)
    scheduled_for: Mapped[date | None] = mapped_column(Date)
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ExerciseCompletion(UUIDPkMixin, Base):
    """Отметка выполнения упражнения (итог/состояние, без поля completed_at в MVP)."""

    __tablename__ = "exercise_completions"
    __table_args__ = (Index("idx_exercise_completions_assignment_id", "assignment_id"),)

    assignment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exercise_assignments.id", ondelete="CASCADE"),
        nullable=False,
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    result: Mapped[dict | None] = mapped_column(JSONB)
    completed: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )


class Alert(UUIDPkMixin, Base):
    """Алерт очереди врача (mandatory/optional/rx; статусы new..dismissed)."""

    __tablename__ = "alerts"
    __table_args__ = (
        CheckConstraint(
            "type IN ('critical_symptom','adherence','missed_diary',"
            "'screening_risk','adverse_event')",
            name="ck_alerts_type",
        ),
        CheckConstraint("priority IN ('mandatory','optional','rx')", name="ck_alerts_priority"),
        CheckConstraint(
            "status IN ('new','in_progress','resolved','dismissed')", name="ck_alerts_status"
        ),
        Index("idx_alerts_patient_id_status", "patient_id", "status"),
        Index("idx_alerts_priority_created_at", "priority", "created_at"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="new", server_default="new")
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
