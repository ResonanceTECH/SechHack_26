from __future__ import annotations

QUESTIONNAIRES: dict[str, dict] = {
    "phq9": {
        "code": "phq9",
        "title": "PHQ-9",
        "questions_count": 9,
        "max_score": 27,
        "version": "1.0",
        "answers_range": (0, 3),
    },
    "gad7": {
        "code": "gad7",
        "title": "GAD-7",
        "questions_count": 7,
        "max_score": 21,
        "version": "1.0",
        "answers_range": (0, 3),
    },
}
