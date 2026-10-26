"""Configurable alert rule engine for screening results."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any

from app.core.config import get_settings


@dataclass(frozen=True)
class AlertRuleResult:
    is_alert: bool
    alert_type: str | None
    priority: str | None
    reason: str | None


@dataclass(frozen=True)
class AlertRule:
    code: str
    kind: str
    threshold: int = 1
    item_index: int = 0
    alert_type: str = "screening_risk"
    priority: str = "mandatory"
    reason: str = "rule"
    enabled: bool = True


DEFAULT_RULES: list[AlertRule] = [
    AlertRule(code="phq9", kind="item_gte", threshold=1, item_index=8,
             alert_type="critical_symptom", priority="mandatory", reason="phq9_item_9"),
    AlertRule(code="phq9", kind="total_gte", threshold=20, item_index=0,
             alert_type="screening_risk", priority="mandatory", reason="phq9_total_ge_20"),
    AlertRule(code="gad7", kind="total_gte", threshold=15, item_index=0,
             alert_type="screening_risk", priority="mandatory", reason="gad7_total_ge_15"),
    AlertRule(code="*", kind="critical", threshold=1, item_index=0,
             alert_type="screening_risk", priority="mandatory", reason="critical"),
]


def _rule_from_dict(d: dict[str, Any]) -> AlertRule:
    return AlertRule(
        code=str(d.get("code", "*")).lower(),
        kind=str(d.get("kind", "total_gte")),
        threshold=int(d.get("threshold", 1)),
        item_index=int(d.get("item_index", 0)),
        alert_type=str(d.get("alert_type", "screening_risk")),
        priority=str(d.get("priority", "mandatory")),
        reason=str(d.get("reason", "rule")),
        enabled=bool(d.get("enabled", True)),
    )


def _load_rules() -> list[AlertRule]:
    settings = get_settings()
    raw = getattr(settings, "alert_rules_json", "") or ""
    path = getattr(settings, "alert_rules_file", "") or ""
    if not raw and path and os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as fh:
                raw = fh.read()
        except OSError:
            raw = ""
    if raw.strip():
        try:
            data = json.loads(raw)
            if isinstance(data, list):
                return [_rule_from_dict(x) for x in data if isinstance(x, dict)]
        except (json.JSONDecodeError, ValueError):
            pass
    env_json = os.environ.get("ALERT_RULES_JSON")
    if env_json:
        try:
            data = json.loads(env_json)
            if isinstance(data, list):
                return [_rule_from_dict(x) for x in data if isinstance(x, dict)]
        except (json.JSONDecodeError, ValueError):
            pass
    return list(DEFAULT_RULES)


_CACHED_RULES: list[AlertRule] | None = None


def get_rules() -> list[AlertRule]:
    global _CACHED_RULES
    if _CACHED_RULES is None:
        _CACHED_RULES = _load_rules()
    return _CACHED_RULES


def reset_rules_cache() -> None:
    global _CACHED_RULES
    _CACHED_RULES = None


def evaluate(
    questionnaire_code: str,
    score: int,
    answers: list[int],
    is_critical: bool,
    critical_reason: str | None = None,
) -> AlertRuleResult:
    code = (questionnaire_code or "").lower()
    for rule in get_rules():
        if not rule.enabled:
            continue
        if rule.code not in ("*", code):
            continue
        triggered = False
        if rule.kind == "item_gte":
            if answers and len(answers) > rule.item_index and answers[rule.item_index] >= rule.threshold:
                triggered = True
        elif rule.kind == "total_gte":
            if score >= rule.threshold:
                triggered = True
        elif rule.kind == "critical":
            if is_critical:
                triggered = True
        if triggered:
            reason = rule.reason
            if rule.kind == "critical" and critical_reason:
                reason = critical_reason
            return AlertRuleResult(True, rule.alert_type, rule.priority, reason)
    return AlertRuleResult(False, None, None, None)