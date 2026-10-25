"""Schedule schemas."""

from __future__ import annotations

from datetime import date, time
from typing import List, Optional

from pydantic import BaseModel, Field


class ClinicSettingsResponse(BaseModel):
    id: str
    clinic_id: str
    timezone: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ClinicSettingsUpdate(BaseModel):
    timezone: str


class PractitionerScheduleEntry(BaseModel):
    weekday: int = Field(ge=0, le=6)
    start_time: time
    end_time: time
    is_available: bool = True


class PractitionerScheduleResponse(BaseModel):
    id: str
    practitioner_id: str
    weekday: int
    start_time: time
    end_time: time
    is_available: bool


class PractitionerScheduleExceptionCreate(BaseModel):
    date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_available: bool = False
    reason: Optional[str] = None


class PractitionerScheduleExceptionResponse(BaseModel):
    id: str
    practitioner_id: str
    date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_available: bool
    reason: Optional[str] = None
