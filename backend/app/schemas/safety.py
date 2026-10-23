from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import date


class SafetyPlanCreate(BaseModel):
    patient_id: str
    title: str
    practitioner_id: Optional[str] = None
    warning_signs: Optional[str] = None
    internal_coping_strategies: Optional[str] = None
    social_contacts: Optional[str] = None
    family_support: Optional[str] = None
    professional_contacts: Optional[str] = None
    emergency_contacts: Optional[str] = None
    safe_environment: Optional[str] = None
    is_active: bool = True
    review_date: Optional[date] = None


class SafetyPlanUpdate(BaseModel):
    title: Optional[str] = None
    warning_signs: Optional[str] = None
    internal_coping_strategies: Optional[str] = None
    social_contacts: Optional[str] = None
    family_support: Optional[str] = None
    professional_contacts: Optional[str] = None
    emergency_contacts: Optional[str] = None
    safe_environment: Optional[str] = None
    is_active: Optional[bool] = None
    review_date: Optional[date] = None


class SafetyPlanResponse(BaseModel):
    id: str
    patient_id: str
    practitioner_id: str
    title: str
    warning_signs: Optional[str] = None
    internal_coping_strategies: Optional[str] = None
    social_contacts: Optional[str] = None
    family_support: Optional[str] = None
    professional_contacts: Optional[str] = None
    emergency_contacts: Optional[str] = None
    safe_environment: Optional[str] = None
    is_active: bool = True
    review_date: Optional[date] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class CrisisSignalCreate(BaseModel):
    patient_id: str
    type: Literal["sos_call", "critical_symptom", "red_flag"]
    source: Literal["mobile_app", "web_app", "screening_result", "practitioner_manual"]
    message: Optional[str] = None
    location: Optional[dict] = None
    triggered_by_screening_id: Optional[str] = None


class CrisisSignalResponse(BaseModel):
    id: str
    patient_id: str
    type: str
    source: str
    message: Optional[str] = None
    location: Optional[dict] = None
    status: str
    priority: str
    created_at: Optional[str] = None
    acknowledged_at: Optional[str] = None
    acknowledged_by: Optional[str] = None
