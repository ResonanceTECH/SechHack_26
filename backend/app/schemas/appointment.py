"""Appointment schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class AppointmentCreate(BaseModel):
    patient_id: str
    practitioner_id: str
    scheduled_at: datetime
    reason: Optional[str] = None
    status: Optional[str] = "scheduled"
    clinic_id: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    practitioner_id: str
    clinic_id: str
    scheduled_at: Optional[datetime] = None
    status: str
    reason: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator("id", "patient_id", "practitioner_id", "clinic_id", mode="before")
    @classmethod
    def _id_to_str(cls, v):
        return str(v) if v is not None else v

    model_config = {"from_attributes": True}


class AppointmentListResponse(BaseModel):
    items: List[AppointmentResponse]
    total: int