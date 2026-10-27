"""Assessment plan schemas."""

from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class AssessmentPlanCreate(BaseModel):
    patient_id: str
    diagnosis_id: Optional[str] = None
    questionnaire_code: str = Field(min_length=1, max_length=50)
    interval_days: int = Field(gt=0)
    enabled: bool = True
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class AssessmentPlanUpdate(BaseModel):
    diagnosis_id: Optional[str] = None
    questionnaire_code: Optional[str] = Field(default=None, min_length=1, max_length=50)
    interval_days: Optional[int] = Field(default=None, gt=0)
    enabled: Optional[bool] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class AssessmentPlanResponse(BaseModel):
    id: str
    patient_id: str
    diagnosis_id: Optional[str] = None
    questionnaire_code: str
    interval_days: int
    enabled: bool
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    created_by: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    next_due_date: Optional[str] = None

    model_config = {"from_attributes": True}


class AssessmentPlanListResponse(BaseModel):
    items: List[AssessmentPlanResponse]
    total: int
