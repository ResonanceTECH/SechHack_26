from app.services.screening_service import ScreeningService
from app.services.alert_rules import screening_alert_rule
from app.core.questionnaire_registry import get_definition

svc = ScreeningService()


def _make_score(n, score):
    answers = [0] * n
    remaining = score
    for i in range(n):
        v = min(3, remaining)
        answers[i] = v
        remaining -= v
        if remaining <= 0:
            break
    return answers


def test_phq_boundaries():
    defn = get_definition("phq9", "1.0")
    cases = [0, 4, 5, 9, 10, 14, 15, 19, 20, 27]
    for score in cases:
        answers = _make_score(9, score)
        assert svc.score_phq9(answers) == score
        expected = defn.severity_for(score)
        assert svc.interpret_phq9(score) == expected


def test_gad_boundaries():
    defn = get_definition("gad7", "1.0")
    cases = [0, 4, 5, 9, 10, 14, 15, 21]
    for score in cases:
        answers = _make_score(7, score)
        assert svc.score_gad7(answers) == score
        expected = defn.severity_for(score)
        assert svc.interpret_gad7(score) == expected


def test_alert_rules_phq9_item9():
    answers = [0] * 9
    answers[8] = 1
    r = screening_alert_rule("phq9", 1, answers, False)
    assert r.is_alert and r.alert_type == "critical_symptom"


def test_alert_rules_thresholds():
    assert screening_alert_rule("phq9", 20, [0] * 9, False).is_alert
    assert screening_alert_rule("gad7", 15, [0] * 7, False).is_alert
    assert not screening_alert_rule("phq9", 5, [0] * 9, False).is_alert


def test_invalid_answers():
    try:
        svc.score_phq9([0] * 8)
        assert False
    except ValueError:
        pass
    try:
        svc.score_phq9([4] * 9)
        assert False
    except ValueError:
        pass
