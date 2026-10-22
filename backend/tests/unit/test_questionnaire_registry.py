from app.core.questionnaire_registry import get_definition, list_codes


def test_list_codes():
    assert "phq9" in list_codes()
    assert "gad7" in list_codes()


def test_definitions():
    phq = get_definition("phq9", "1.0")
    assert phq is not None
    assert len(phq.questions) == 9
    gad = get_definition("gad7", "1.0")
    assert gad is not None
    assert len(gad.questions) == 7


def test_unknown():
    assert get_definition("unknown", "1.0") is None
    assert get_definition("phq9", "9.9") is None


def test_validation_invalid_version():
    assert get_definition("phq9", "2.0") is None
