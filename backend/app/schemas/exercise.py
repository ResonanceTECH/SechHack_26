"""Exercise / care-plan schemas."""
from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from typing import Annotated
from pydantic import BaseModel, Field, BeforeValidator

StrUUID = Annotated[str, BeforeValidator(lambda v: str(v) if v is not None else None)]


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
    id: StrUUID
    patient_id: StrUUID
    practitioner_id: StrUUID
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
    id: StrUUID
    care_plan_id: StrUUID
    patient_id: Optional[StrUUID] = None
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
    id: StrUUID
    assignment_id: StrUUID
    patient_id: StrUUID
    result: Optional[dict] = None
    completed: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ComplianceResponse(BaseModel):
    assignment_id: str
    completions: int
    completed: bool
    last_completed_at: Optional[datetime] = None