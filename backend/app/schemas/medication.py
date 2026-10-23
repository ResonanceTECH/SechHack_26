"""Medication schemas."""
from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MedicationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    international_name: Optional[str] = Field(default=None, max_length=255)
    dosage_form: Optional[str] = Field(default=None, max_length=100)
    strength: Optional[str] = Field(default=None, max_length=100)
    manufacturer: Optional[str] = Field(default=None, max_length=255)
    instructions_url: Optional[str] = Field(default=None, max_length=500)
    contraindications: Optional[str] = None
    side_effects: Optional[str] = None
    interactions: Optional[str] = None
    patient_instruction: Optional[str] = None


class MedicationUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    international_name: Optional[str] = Field(default=None, max_length=255)
    dosage_form: Optional[str] = Field(default=None, max_length=100)
    strength: Optional[str] = Field(default=None, max_length=100)
    manufacturer: Optional[str] = Field(default=None, max_length=255)
    instructions_url: Optional[str] = Field(default=None, max_length=500)
    contraindications: Optional[str] = None
    side_effects: Optional[str] = None
    interactions: Optional[str] = None
    patient_instruction: Optional[str] = None


class MedicationFullResponse(BaseModel):
    id: str
    name: str
    international_name: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    manufacturer: Optional[str] = None
    instructions_url: Optional[str] = None
    contraindications: Optional[str] = None
    side_effects: Optional[str] = None
    interactions: Optional[str] = None
    patient_instruction: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class MedicationBriefResponse(BaseModel):
    id: str
    name: str
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    patient_instruction: Optional[str] = None
    instructions_url: Optional[str] = None
    is_prescribed: bool = False
    adherence: Optional[float] = None

    model_config = {"from_attributes": True}


class MedicationListResponse(BaseModel):
    items: List[MedicationFullResponse]
    total: int


class PrescriptionCreate(BaseModel):
    patient_id: str
    medication_id: str
    dosage: str = Field(min_length=1, max_length=100)
    frequency: str = Field(min_length=1, max_length=255)
    start_date: date
    end_date: date


class PrescriptionUpdate(BaseModel):
    dosage: Optional[str] = Field(default=None, min_length=1, max_length=100)
    frequency: Optional[str] = Field(default=None, min_length=1, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class PrescriptionResponse(BaseModel):
    id: str
    patient_id: str
    practitioner_id: str
    medication_id: str
    medication_name: Optional[str] = None
    dosage: str
    frequency: str
    start_date: date
    end_date: date
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PrescriptionListResponse(BaseModel):
    items: List[PrescriptionResponse]
    total: int


class AdherenceCreate(BaseModel):
    prescription_id: str
    taken_at: datetime
    is_taken: bool
    note: Optional[str] = None


class AdherenceResponse(BaseModel):
    id: str
    prescription_id: str
    taken_at: datetime
    is_taken: bool
    note: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AdherenceListResponse(BaseModel):
    items: List[AdherenceResponse]
    total: int
