from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class AlertRuleResult:
    is_alert: bool
    alert_type: str | None
    priority: str | None
    reason: str | None


def screening_alert_rule(
    questionnaire_code: str,
    score: int,
    answers: list[int],
    is_critical: bool,
    critical_reason: str | None = None,
) -> AlertRuleResult:
    """Reusable alert rule derived from MODULES.md screening rules."""
    code = (questionnaire_code or "").lower()
    if code == "phq9":
        if answers and len(answers) >= 9 and answers[8] >= 1:
            return AlertRuleResult(True, "critical_symptom", "mandatory", "phq9_item_9")
        if score >= 20:
            return AlertRuleResult(True, "screening_risk", "mandatory", "phq9_total_ge_20")
    if code == "gad7" and score >= 15:
        return AlertRuleResult(True, "screening_risk", "mandatory", "gad7_total_ge_15")
    if is_critical:
        return AlertRuleResult(True, "screening_risk", "mandatory", critical_reason or "critical")
    return AlertRuleResult(False, None, None, None)


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
