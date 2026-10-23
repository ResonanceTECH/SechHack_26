from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Question:
    id: str
    text: str
    order: int


@dataclass(frozen=True)
class AnswerOption:
    value: int
    label: str


@dataclass(frozen=True)
class SeverityBand:
    min_score: int
    max_score: int
    label: str


@dataclass(frozen=True)
class QuestionnaireDefinition:
    code: str
    version: str
    title: str
    description: str
    questions: list[Question]
    answer_scale: list[AnswerOption]
    scoring: str
    max_score: int
    severity_bands: list[SeverityBand]
    critical_rules: dict[str, Any]

    def severity_for(self, score: int) -> str:
        for band in self.severity_bands:
            if band.min_score <= score <= band.max_score:
                return band.label
        return "unknown"

    def to_dict(self) -> dict:
        return {
            "code": self.code,
            "version": self.version,
            "title": self.title,
            "description": self.description,
            "questions": [{"id": q.id, "text": q.text, "order": q.order} for q in self.questions],
            "answer_scale": [{"value": a.value, "label": a.label} for a in self.answer_scale],
            "scoring": self.scoring,
            "max_score": self.max_score,
            "severity_bands": [{"min_score": b.min_score, "max_score": b.max_score, "label": b.label} for b in self.severity_bands],
            "critical_rules": self.critical_rules,
        }


_ANSWER_SCALE_0_3 = [AnswerOption(i, str(i)) for i in range(4)]

_PHQ9_QUESTIONS = [
    "Мало интереса или удовольствия от дел",
    "Подавленность, угнетённость или безнадёжность",
    "Трудности с засыпанием, сном или сонливостью",
    "Усталость или отсутствие энергии",
    "Плохой аппетит или переедание",
    "Негативное отношение к себе",
    "Трудности с концентрацией",
    "Замедленность или, наоборот, суетливость",
    "Мысли, что лучше умереть, или навредить себе",
    # Вас посещали мысли о смерти, самоубийстве? (src: https://app.holst.so/share/b/27af29bb-636d-418c-b139-66a768b1f81e?objectId=93f77a10-c40f-4dac-8ebf-008e806223f1)
]

_GAD7_QUESTIONS = [
    "Чувство нервозности, тревоги или напряжения",
    "Невозможность остановить или контролировать беспокойство",
    "Чрезмерное беспокойство по разным поводам",
    "Трудности с расслаблением",
    "Беспокойность, мешающая усидеть на месте",
    "Быстрая утомляемость или раздражительность",
    "Страх, что произойдёт что-то ужасное",
]

REGISTRY: dict[tuple[str, str], QuestionnaireDefinition] = {}


def _register(defn: QuestionnaireDefinition) -> None:
    REGISTRY[(defn.code, defn.version)] = defn


for code, title, questions, bands, critical in [
    ("phq9", "PHQ-9", _PHQ9_QUESTIONS,
     [(0, 4, "минимальная"), (5, 9, "лёгкая"), (10, 14, "умеренная"), (15, 19, "умеренно выраженная"), (20, 27, "тяжёлая")],
     {"item_index": 8, "item_threshold": 1, "total_threshold": 20}),
    ("gad7", "GAD-7", _GAD7_QUESTIONS,
     [(0, 4, "минимальная"), (5, 9, "лёгкая"), (10, 14, "умеренная"), (15, 21, "тяжёлая")],
     {"total_threshold": 15}),
]:
    _register(QuestionnaireDefinition(
        code=code,
        version="1.0",
        title=title,
        description=f"{title} screening questionnaire",
        questions=[Question(id=f"q{i+1}", text=text, order=i+1) for i, text in enumerate(questions)],
        answer_scale=list(_ANSWER_SCALE_0_3),
        scoring="sum",
        max_score=27 if code == "phq9" else 21,
        severity_bands=[SeverityBand(mn, mx, label) for mn, mx, label in bands],
        critical_rules=critical,
    ))


def list_codes() -> list[str]:
    return sorted({code for code, _ in REGISTRY})


def get_versions(code: str) -> list[str]:
    return sorted({ver for c, ver in REGISTRY if c == code})


def get_definition(code: str, version: str | None = None) -> QuestionnaireDefinition | None:
    if version is None:
        versions = get_versions(code)
        if not versions:
            return None
        version = versions[-1]
    return REGISTRY.get((code, version))


def latest_version(code: str) -> str | None:
    versions = get_versions(code)
    return versions[-1] if versions else None
