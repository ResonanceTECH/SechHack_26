from __future__ import annotations

from typing import TypedDict


class ScreeningCompletedEvent(TypedDict):
    event_type: str
    patient_id: str
    screening_id: str
    questionnaire_code: str
    questionnaire_version: str
    score: int
    severity: str
    is_critical: bool
    critical_reason: str | None
    created_at: str
