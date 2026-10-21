"""Patient schemas (API_CONTRACTS.md §5, §9)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class PatientListItem(BaseModel):
    """Item in patient list response."""
    id: str
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    role: str

    model_config = {"from_attributes": True}


class PatientUpdate(BaseModel):
    """Fields可更新 для профиля пациента."""
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    birth_date: str | None = Field(default=None)  # ISO date string
    gender: str | None = Field(default=None)  # male/female/other/prefer_not_to_say

    model_config = {"from_attributes": True}


class PatientDetail(PatientUpdate):
    """Full patient detail response."""
    id: str
    email: str
    user_role: str
    clinic_id: str | None = None
    created_at: str | None = None

    model_config = {"from_attributes": True}