"""Расписание врачей и настройки клиники (Этап 11)."""

from __future__ import annotations

import uuid
from datetime import time

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Time, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class ClinicSettings(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "clinic_settings"

    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    timezone: Mapped[str] = mapped_column(String(64), default="Europe/Moscow", server_default="Europe/Moscow")


class PractitionerSchedule(UUIDPkMixin, Base):
    __tablename__ = "practitioner_schedules"

    practitioner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False
    )
    weekday: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), default=None, server_default=func.now())
    updated_at: Mapped[object] = mapped_column(DateTime(timezone=True), default=None, server_default=func.now(), onupdate=func.now())


class PractitionerScheduleException(UUIDPkMixin, Base):
    __tablename__ = "practitioner_schedule_exceptions"

    practitioner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[object] = mapped_column(Date, nullable=False)
    start_time: Mapped[time | None] = mapped_column(Time)
    end_time: Mapped[time | None] = mapped_column(Time)
    is_available: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    reason: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), default=None, server_default=func.now())
    updated_at: Mapped[object] = mapped_column(DateTime(timezone=True), default=None, server_default=func.now(), onupdate=func.now())
