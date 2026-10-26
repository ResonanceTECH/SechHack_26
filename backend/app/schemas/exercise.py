"""Exercise / care-plan schemas."""
from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CarePlanCreate(BaseModel):
    patient_id: str
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = "active"


class CarePlanUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None


class CarePlanResponse(BaseModel):
    id: str
    patient_id: str
    practitioner_id: str
    title: str
    description: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CarePlanListResponse(BaseModel):
    items: List[CarePlanResponse]
    total: int


class ExerciseAssignmentCreate(BaseModel):
    patient_id: Optional[str] = None
    care_plan_id: Optional[str] = None
    exercise_type: str = Field(min_length=1, max_length=100)
    payload: Optional[dict] = None
    scheduled_for: Optional[date] = None
    due_at: Optional[datetime] = None


class ExerciseAssignmentUpdate(BaseModel):
    exercise_type: Optional[str] = Field(default=None, min_length=1, max_length=100)
    payload: Optional[dict] = None
    scheduled_for: Optional[date] = None
    due_at: Optional[datetime] = None


class ExerciseAssignmentResponse(BaseModel):
    id: str
    care_plan_id: str
    patient_id: Optional[str] = None
    exercise_type: str
    payload: Optional[dict] = None
    scheduled_for: Optional[date] = None
    due_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ExerciseAssignmentListResponse(BaseModel):
    items: List[ExerciseAssignmentResponse]
    total: int


class ExerciseCompletionCreate(BaseModel):
    result: Optional[dict] = None
    completed: bool = True


class ExerciseCompletionResponse(BaseModel):
    id: str
    assignment_id: str
    patient_id: str
    result: Optional[dict] = None
    completed: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ComplianceResponse(BaseModel):
    assignment_id: str
    completions: int
    completed: bool
    last_completed_at: Optional[datetime] = None