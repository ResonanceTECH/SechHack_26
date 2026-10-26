from __future__ import annotations

from typing import Any

from app.services.alert_rules.engine import (
    AlertRuleResult,
    evaluate as _evaluate,
)


def screening_alert_rule(
    questionnaire_code: str,
    score: int,
    answers: list[int],
    is_critical: bool,
    critical_reason: str | None = None,
) -> AlertRuleResult:
    """Reusable alert rule derived from MODULES.md screening rules.

    Delegates to the configurable rule engine (see ``engine.py``).
    """
    return _evaluate(questionnaire_code, score, answers, is_critical, critical_reason)


def screening_event_payload(
    patient_id: str,
    screening_id: str,
    questionnaire_code: str,
    questionnaire_version: str,
    score: int,
    severity: str,
    is_critical: bool,
    critical_reason: str | None,
    created_at: str,
) -> dict[str, Any]:
    return {
        "event_type": "screening.completed",
        "patient_id": patient_id,
        "screening_id": screening_id,
        "questionnaire_code": questionnaire_code,
        "questionnaire_version": questionnaire_version,
        "score": score,
        "severity": severity,
        "is_critical": is_critical,
        "critical_reason": critical_reason,
        "created_at": created_at,
    }
