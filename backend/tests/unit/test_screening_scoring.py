import pytest
from app.services.screening_service import ScreeningService


def test_phq9_interpret():
    svc = ScreeningService()
    cases = [(0, "минимальная"), (4, "минимальная"), (5, "лёгкая"), (9, "лёгкая"), (10, "умеренная"), (14, "умеренная"), (15, "умеренно выраженная"), (19, "умеренно выраженная"), (20, "тяжёлая"), (27, "тяжёлая")]
    for score, label in cases:
        assert svc.interpret_phq9(score) == label


def test_gad7_interpret():
    svc = ScreeningService()
    cases = [(0, "минимальная"), (4, "минимальная"), (5, "лёгкая"), (9, "лёгкая"), (10, "умеренная"), (14, "умеренная"), (15, "тяжёлая"), (21, "тяжёлая")]
    for score, label in cases:
        assert svc.interpret_gad7(score) == label


def test_scoring():
    svc = ScreeningService()
    answers = [1,2,3,0,1,2,3,0,1]
    assert svc.score_phq9(answers) == sum(answers)
    assert svc.score_gad7([1,2,3,0,1,2,3]) == 12


def test_critical_phq9():
    svc = ScreeningService()
    answers = [0]*8 + [1]
    assert svc.is_critical_phq9(answers, 1) is True
    answers2 = [3]*9
    assert svc.is_critical_phq9(answers2, 27) is True
    answers3 = [1]*8 + [0]
    assert svc.is_critical_phq9(answers3, 8) is False


def test_critical_gad7():
    svc = ScreeningService()
    assert svc.is_critical_gad7(15) is True
    assert svc.is_critical_gad7(14) is False


def test_invalid_answers():
    svc = ScreeningService()
    with pytest.raises(ValueError):
        svc.score_phq9([0]*8)
    with pytest.raises(ValueError):
        svc.score_phq9([0]*9 + [1])
    with pytest.raises(ValueError):
        svc.score_phq9([0,0,0,0,0,0,0,0,4])
    with pytest.raises(ValueError):
        svc.score_gad7([0]*7 + [1])
