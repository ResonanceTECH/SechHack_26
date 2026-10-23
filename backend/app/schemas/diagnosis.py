"""Diagnosis schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class DiagnosisCreate(BaseModel):
    patient_id: str
    coding_system: str = Field(pattern="^(ICD10|ICD11)$")
    code: str = Field(min_length=1, max_length=30)
    title: Optional[str] = Field(default=None, max_length=255)
    is_primary: bool = False
    status: str = Field(default="active", pattern="^(active|remission|resolved|closed)$")
    diagnosed_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    is_confirmed: bool = True
    notes: Optional[str] = None


class DiagnosisUpdate(BaseModel):
    coding_system: Optional[str] = Field(default=None, pattern="^(ICD10|ICD11)$")
    code: Optional[str] = Field(default=None, min_length=1, max_length=30)
    title: Optional[str] = Field(default=None, max_length=255)
    is_primary: Optional[bool] = None
    status: Optional[str] = Field(default=None, pattern="^(active|remission|resolved|closed)$")
    diagnosed_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    is_confirmed: Optional[bool] = None
    notes: Optional[str] = None


class DiagnosisResponse(BaseModel):
    id: str
    patient_id: str
    coding_system: str
    code: str
    title: Optional[str] = None
    is_primary: bool
    status: str
    diagnosed_at: Optional[str] = None
    ended_at: Optional[str] = None
    diagnosed_by: Optional[str] = None
    is_confirmed: bool
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class DiagnosisListResponse(BaseModel):
    items: List[DiagnosisResponse]
    total: int
