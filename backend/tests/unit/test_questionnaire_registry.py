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



def test_answer_scale_has_text_labels():
    for code in list_codes():
        definition = get_definition(code, "1.0")
        assert definition is not None
        values = [option.value for option in definition.answer_scale]
        labels = [option.label for option in definition.answer_scale]
        assert values == sorted(values)
        assert len(values) == len(set(values))
        assert all(label.strip() for label in labels)


def test_phq9_gad7_answer_labels_are_clinical_anchors():
    for code in ("phq9", "gad7"):
        definition = get_definition(code, "1.0")
        assert definition is not None
        assert [(o.value, o.label) for o in definition.answer_scale] == [
            (0, "Совсем нет"),
            (1, "Несколько дней"),
            (2, "Более половины дней"),
            (3, "Почти каждый день"),
        ]


def test_binary_answer_labels_are_textual():
    for code in ("hcl8", "hcl33", "cssrs"):
        definition = get_definition(code, "1.0")
        assert definition is not None
        assert [(o.value, o.label) for o in definition.answer_scale] == [
            (0, "Нет"),
            (1, "Да"),
        ]


def test_validation_invalid_version():
    assert get_definition("phq9", "2.0") is None
