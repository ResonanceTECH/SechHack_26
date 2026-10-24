from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Question:
    id: str
    text: str
    order: int
    max_value: int | None = None


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
            "questions": [{"id": q.id, "text": q.text, "order": q.order, "max_value": q.max_value} for q in self.questions],
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


_HCL8_QUESTIONS = [
    "Периоды приподнятого настроения",
    "Увеличение энергии/активности",
    "Снижение потребности во сне",
    "Большая разговорчивость",
    "Ускорение мыслей",
    "Отвлекаемость",
    "Увеличение социальной активности",
    "Рискованное поведение",
]

_register(QuestionnaireDefinition(
    code="hcl8",
    version="1.0",
    title="HCL-8",
    description="Hypomania Checklist (8 items)",
    questions=[Question(id=f"q{i+1}", text=text, order=i+1) for i, text in enumerate(_HCL8_QUESTIONS)],
    answer_scale=[AnswerOption(0, "Нет"), AnswerOption(1, "Да")],
    scoring="sum",
    max_score=8,
    severity_bands=[SeverityBand(0, 2, "низкий"), SeverityBand(3, 5, "умеренный"), SeverityBand(6, 8, "высокий")],
    critical_rules={"total_threshold": 6},
))


_PDSS_QUESTIONS = [
    "Как много развернутых или неразвернутых панических атак у вас было за прошедшие 7 дней?",
    "Если у вас были панические атаки за прошедшие 7 дней, насколько сильный дискомфорт они вам причинили в момент их появления?",
    "Как часто и насколько сильно за прошедшие 7 дней вы волновались по поводу того, когда случится следующая паническая атака?",
    "В течение прошедших 7 дней были ли ситуации или места, которые вы избегали или чувствовали в этот момент страх?",
    "На протяжении прошедших 7 дней были ли какие-то виды деятельности, которые вы избегали или чувствовали страх?",
    "Насколько панические атаки мешали вашей профессиональной/учебной деятельности за прошедшие 7 дней?",
    "Насколько панические атаки мешали вашей социальной жизни и отношениям за прошедшие 7 дней?",
]
_register(QuestionnaireDefinition(
    code="pdss",
    version="1.0",
    title="PDSS",
    description="Panic Disorder Severity Scale",
    questions=[Question(id=f"q{i+1}", text=text, order=i+1) for i, text in enumerate(_PDSS_QUESTIONS)],
    answer_scale=[AnswerOption(i, str(i)) for i in range(5)],
    scoring="sum",
    max_score=28,
    severity_bands=[SeverityBand(0, 7, "лёгкая"), SeverityBand(8, 14, "умеренная"), SeverityBand(15, 28, "тяжёлая")],
    critical_rules={"total_threshold": 15},
))

_CSSRS_QUESTIONS = [
    "Желание умереть: были ли у вас мысли о том, что вы хотели бы умереть или заснуть и не проснуться?",
    "Мысли о самоубийстве: были ли у вас мысли о том, чтобы убить себя?",
    "План: думали ли вы о том, как бы вы это сделали?",
    "Намерение: были ли у вас намерения действовать в соответствии с этими мыслями?",
    "Подготовка: предпринимали ли вы какие-либо шаги для подготовки к попытке самоубийства?",
    "Попытка: предпринимали ли вы когда-либо попытку убить себя?",
]
_register(QuestionnaireDefinition(
    code="cssrs",
    version="1.0",
    title="C-SSRS",
    description="Columbia Suicide Severity Rating Scale (screener)",
    questions=[Question(id=f"q{i+1}", text=text, order=i+1) for i, text in enumerate(_CSSRS_QUESTIONS)],
    answer_scale=[AnswerOption(0, "Нет"), AnswerOption(1, "Да")],
    scoring="sum",
    max_score=6,
    severity_bands=[SeverityBand(0, 0, "отсутствует"), SeverityBand(1, 2, "низкий"), SeverityBand(3, 6, "высокий")],
    critical_rules={"any_yes": True},
))

_ISI_QUESTIONS = [
    "Трудности с засыпанием",
    "Трудности с поддержанием сна",
    "Раннее пробуждение",
    "Удовлетворённость сном",
    "Нарушение дневной активности",
    "Заметность проблем со сном для других",
    "Дистресс из-за проблем со сном",
]

_register(QuestionnaireDefinition(
    code="isi",
    version="1.0",
    title="ISI",
    description="Insomnia Severity Index",
    questions=[Question(id=f"q{i+1}", text=text, order=i+1) for i, text in enumerate(_ISI_QUESTIONS)],
    answer_scale=[AnswerOption(i, str(i)) for i in range(5)],
    scoring="sum",
    max_score=28,
    severity_bands=[SeverityBand(0, 7, "нет"), SeverityBand(8, 14, "подпороговая"), SeverityBand(15, 21, "умеренная"), SeverityBand(22, 28, "тяжёлая")],
    critical_rules={"total_threshold": 15},
))

_HCL33_QUESTIONS = [
    "Мне требуется меньше сна.",
    "Я чувствую себя более энергичным и активным.",
    "Я более уверен в себе.",
    "Работа доставляет мне больше удовольствия.",
    "Я более социально активен (чаще звоню по телефону, чаще развлекаюсь).",
    "Мне хочется больше путешествовать и/или я больше путешествую.",
    "Я вожу автомобиль с большей скоростью или чаще рискую во время вождения.",
    "Я трачу больше денег, чем обычно (слишком много денег).",
    "Я чаще рискую в повседневной жизни (на работе или в других ситуациях).",
    "Я более активен физически (спорт и т. д.).",
    "Я планирую больше действий и проектов.",
    "У меня больше идей, я становлюсь более креативным.",
    "Я становлюсь менее застенчивым и закомплексованным.",
    "Я одеваюсь более ярко и экстравагантно.",
    "Мне хочется встречаться с большим количеством людей или я действительно чаще общаюсь с людьми.",
    "Я больше интересуюсь сексом и/или становлюсь более сексуально активным.",
    "Я больше говорю.",
    "Я думаю быстрее.",
    "Во время разговора я чаще шучу и каламбурю.",
    "Я легко отвлекаюсь.",
    "Я вовлекаюсь во множество новых вещей.",
    "Мои мысли перепрыгивают с одной темы на другую.",
    "Я всё делаю гораздо быстрее и/или легче, чем обычно.",
    "Я более нетерпелив и/или легче раздражаюсь.",
    "Я могу быть утомительным или раздражать окружающих.",
    "Я чаще вступаю в ссоры.",
    "Мое настроение более приподнятое и оптимистическое.",
    "Я пью больше кофе.",
    "Я выкуриваю большее число сигарет.",
    "Я пью больше алкоголя.",
    "Я принимаю больше лекарств (седативных, анксиолитиков, стимуляторов...).",
    "Я чаще играю на компьютере или увлекаюсь азартными играми.",
    "Я больше ем или чаще переедаю.",
]

_register(QuestionnaireDefinition(
    code="hcl33",
    version="1.0",
    title="HCL-33",
    description="Hypomania Checklist (33 items)",
    questions=[Question(id=f"q{i+1}", text=text, order=i+1) for i, text in enumerate(_HCL33_QUESTIONS)],
    answer_scale=[AnswerOption(0, "Нет"), AnswerOption(1, "Да")],
    scoring="sum",
    max_score=33,
    severity_bands=[SeverityBand(0, 7, "низкий"), SeverityBand(8, 13, "умеренный"), SeverityBand(14, 33, "высокий")],
    critical_rules={"total_threshold": 14},
))
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


_YMRS_QUESTIONS = [
    "Приподнятое настроение",
    "Увеличение моторной активности, энергичность",
    "Сексуальная заинтересованность",
    "Сон",
    "Раздражительность",
    "Речь (скорость и количество)",
    "Нарушение мышления",
    "Содержание идей",
    "Агрессивное поведение",
    "Внешний вид",
    "Сознание болезни",
]

_YMRS_MAX_VALUES = [4, 4, 4, 4, 8, 8, 4, 8, 8, 4, 4]

_register(QuestionnaireDefinition(
    code="ymrs",
    version="1.0",
    title="YMRS",
    description="Young Mania Rating Scale",
    questions=[Question(id=f"q{i+1}", text=text, order=i+1, max_value=_YMRS_MAX_VALUES[i]) for i, text in enumerate(_YMRS_QUESTIONS)],
    answer_scale=[AnswerOption(i, str(i)) for i in range(9)],
    scoring="sum",
    max_score=60,
    severity_bands=[
        SeverityBand(0, 12, "ремиссия"),
        SeverityBand(13, 19, "лёгкая"),
        SeverityBand(20, 25, "умеренная"),
        SeverityBand(26, 37, "тяжёлая"),
        SeverityBand(38, 60, "очень тяжёлая"),
    ],
    critical_rules={"total_threshold": 20},
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
