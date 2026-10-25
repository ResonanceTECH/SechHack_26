from __future__ import annotations

from pydantic import BaseModel, Field


class ScreeningAnswer(BaseModel):
    question_id: str
    value: int = Field(ge=0, le=8)


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
from typing import Any


class AnswerOptionSchema(BaseModel):
    value: int
    label: str


class QuestionSchema(BaseModel):
    id: str
    text: str
    order: int
    max_value: int | None = None
    anchors: list[AnswerOptionSchema] | None = None


class SeverityBandSchema(BaseModel):
    min_score: int
    max_score: int
    label: str


class QuestionnaireDetailSchema(BaseModel):
    code: str
    version: str
    title: str
    description: str | None = None
    questions: list[QuestionSchema]
    answer_scale: list[AnswerOptionSchema]
    scoring: Any = None
    max_score: int
    severity_bands: list[SeverityBandSchema]
    critical_rules: Any = None


class QuestionnaireDetailEnvelope(BaseModel):
    data: QuestionnaireDetailSchema | None = None
    meta: dict[str, Any] = Field(default_factory=dict)
    error: dict[str, Any] | None = None

