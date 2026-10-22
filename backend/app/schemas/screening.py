from __future__ import annotations

from pydantic import BaseModel, Field


class ScreeningAnswer(BaseModel):
    question_id: str
    value: int = Field(ge=0, le=3)


class ScreeningCreateRequest(BaseModel):
    questionnaire_type: str = Field(..., examples=["phq9", "gad7"])
    questionnaire_version: str = Field(default="1.0")
    answers: list[ScreeningAnswer] = Field(...)

    model_config = {"json_schema_extra": {"example": {"questionnaire_type": "phq9", "questionnaire_version": "1.0", "answers": [{"question_id": "q1", "value": 1}]}}}


class ScreeningResponse(BaseModel):
    id: str
    patient_id: str
    questionnaire_type: str
    questionnaire_version: str
    score: int
    answers: list | dict | None = None
    is_critical: bool
    severity: str | None = None
    critical_reason: str | None = None
    interpretation: str | None = None
    created_at: str | None = None


class ScreeningListItem(BaseModel):
    id: str
    questionnaire_type: str
    score: int
    is_critical: bool
    created_at: str | None = None


class ScreeningHistoryResponse(BaseModel):
    items: list[ScreeningListItem]
    total: int


class QuestionnaireInfo(BaseModel):
    code: str
    title: str
    questions_count: int
    max_score: int
    version: str
