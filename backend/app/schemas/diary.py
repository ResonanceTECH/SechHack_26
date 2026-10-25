from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DiaryCreateRequest(BaseModel):
    recorded_at: datetime
    mood_score: Optional[int] = Field(default=None, ge=-3, le=3)
    anxiety_score: Optional[int] = Field(default=None, ge=0, le=4)
    energy_score: Optional[int] = Field(default=None, ge=0, le=4)
    functioning_score: Optional[int] = Field(default=None, ge=0, le=4)
    sleep_hours: Optional[float] = Field(default=None, ge=0)
    sleep_quality: Optional[int] = Field(default=None, ge=0, le=4)
    notes: Optional[str] = None
    device_id: Optional[str] = None


class DiaryUpdateRequest(BaseModel):
    recorded_at: Optional[datetime] = None
    mood_score: Optional[int] = Field(default=None, ge=-3, le=3)
    anxiety_score: Optional[int] = Field(default=None, ge=0, le=4)
    energy_score: Optional[int] = Field(default=None, ge=0, le=4)
    functioning_score: Optional[int] = Field(default=None, ge=0, le=4)
    sleep_hours: Optional[float] = Field(default=None, ge=0)
    sleep_quality: Optional[int] = Field(default=None, ge=0, le=4)
    notes: Optional[str] = None


class DiaryEntryResponse(BaseModel):
    id: str
    patient_id: str
    recorded_at: Optional[str] = None
    mood_score: Optional[int] = None
    anxiety_score: Optional[int] = None
    energy_score: Optional[int] = None
    functioning_score: Optional[int] = None
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = None
    notes: Optional[str] = None
    device_id: Optional[str] = None
    synced_at: Optional[str] = None
    created_at: Optional[str] = None


class DiaryBulkEntry(BaseModel):
    recorded_at: datetime
    mood_score: Optional[int] = Field(default=None, ge=-3, le=3)
    anxiety_score: Optional[int] = Field(default=None, ge=0, le=4)
    energy_score: Optional[int] = Field(default=None, ge=0, le=4)
    functioning_score: Optional[int] = Field(default=None, ge=0, le=4)
    sleep_hours: Optional[float] = Field(default=None, ge=0)
    sleep_quality: Optional[int] = Field(default=None, ge=0, le=4)
    notes: Optional[str] = None


class DiaryBulkSyncRequest(BaseModel):
    device_id: str
    entries: list[DiaryBulkEntry]


class DiaryBulkSyncResponse(BaseModel):
    created: int
    skipped: int
    items: list[DiaryEntryResponse]


class DiarySummaryResponse(BaseModel):
    patient_id: str
    from_date: Optional[str] = None
    to_date: Optional[str] = None
    total_entries: int
    avg_mood: Optional[float] = None
    avg_anxiety: Optional[float] = None
    avg_energy: Optional[float] = None
    avg_functioning: Optional[float] = None