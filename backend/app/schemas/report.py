"""Report schemas (JSON aggregates; PDF export not implemented in MVP)."""

from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class ReportPatient(BaseModel):
    id: str
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    birth_date: Optional[datetime] = None
    gender: Optional[str] = None
    clinic_id: Optional[str] = None


class PreVisitReportResponse(BaseModel):
    patient: ReportPatient
    diagnoses: List[dict[str, Any]] = Field(default_factory=list)
    care_plans: List[dict[str, Any]] = Field(default_factory=list)
    appointments: List[dict[str, Any]] = Field(default_factory=list)
    recent_screenings: List[dict[str, Any]] = Field(default_factory=list)
    diary_summary: dict[str, Any] = Field(default_factory=dict)


class ClinicAnalyticsResponse(BaseModel):
    patients_total: int
    practitioners_total: int
    appointments_total: int
    appointments_by_status: dict[str, int] = Field(default_factory=dict)
    screenings_total: int
    diary_entries_total: int
