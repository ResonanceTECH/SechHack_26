export type AnswerOption = {
  score: 0 | 1 | 2 | 3;
  label: string;
};

export type QuestionnaireInstrument = "PHQ-9" | "GAD-7";

export type QuestionnaireQuestion = {
  id: string;
  instrument: QuestionnaireInstrument;
  sectionLabel: string;
  prompt: string;
  text: string;
};

export const LIKERT_OPTIONS: AnswerOption[] = [
  { score: 0, label: "Ни разу" },
  { score: 1, label: "Несколько дней" },
  { score: 2, label: "Больше половины дней" },
  { score: 3, label: "Почти каждый день" },
];

const PHQ9_PROMPT =
  "За последние 2 недели как часто вас беспокоили:";

const GAD7_PROMPT =
  "За последние 2 недели как часто вас беспокоили:";

export const QUESTIONNAIRE_QUESTIONS: QuestionnaireQuestion[] = [
  {
    id: "phq9-1",
    instrument: "PHQ-9",
    sectionLabel: "Настроение · PHQ-9",
    prompt: PHQ9_PROMPT,
    text: "Мало интереса или удовольствия от обычных занятий",
  },
  {
    id: "phq9-2",
    instrument: "PHQ-9",
    sectionLabel: "Настроение · PHQ-9",
    prompt: PHQ9_PROMPT,
    text: "Подавленное настроение, тоска или чувство безнадёжности",
  },
  {
    id: "phq9-3",
    instrument: "PHQ-9",
    sectionLabel: "Настроение · PHQ-9",
    prompt: PHQ9_PROMPT,
    text: "Трудности с засыпанием, прерывистый сон или, напротив, слишком долгий сон",
  },
  {
    id: "phq9-4",
    instrument: "PHQ-9",
    sectionLabel: "Настроение · PHQ-9",
    prompt: PHQ9_PROMPT,
    text: "Чувство усталости или отсутствие энергии",
  },
  {
    id: "phq9-5",
    instrument: "PHQ-9",
    sectionLabel: "Настроение · PHQ-9",
    prompt: PHQ9_PROMPT,
    text: "Плохой аппетит или переедание",
  },
  {
    id: "phq9-6",
    instrument: "PHQ-9",
    sectionLabel: "Настроение · PHQ-9",
    prompt: PHQ9_PROMPT,
    text: "Плохое мнение о себе — ощущение, что вы неудачник или подвели себя или семью",
  },
  {
    id: "phq9-7",
    instrument: "PHQ-9",
    sectionLabel: "Настроение · PHQ-9",
    prompt: PHQ9_PROMPT,
    text: "Трудности с концентрацией внимания, например при чтении или просмотре ТВ",
  },
  {
    id: "phq9-8",
    instrument: "PHQ-9",
    sectionLabel: "Настроение · PHQ-9",
    prompt: PHQ9_PROMPT,
    text: "Двигались или говорили так медленно, что другие это замечали — или, напротив, были настолько беспокойны, что двигались больше обычного",
  },
  {
    id: "phq9-9",
    instrument: "PHQ-9",
    sectionLabel: "Настроение · PHQ-9",
    prompt: PHQ9_PROMPT,
    text: "Мысли о том, что лучше было бы умереть, или о причинении себе вреда",
  },
  {
    id: "gad7-1",
    instrument: "GAD-7",
    sectionLabel: "Тревога · GAD-7",
    prompt: GAD7_PROMPT,
    text: "Чувство нервозности, тревоги или напряжения",
  },
  {
    id: "gad7-2",
    instrument: "GAD-7",
    sectionLabel: "Тревога · GAD-7",
    prompt: GAD7_PROMPT,
    text: "Неспособность справиться с беспокойством",
  },
  {
    id: "gad7-3",
    instrument: "GAD-7",
    sectionLabel: "Тревога · GAD-7",
    prompt: GAD7_PROMPT,
    text: "Чрезмерное беспокойство по разным поводам",
  },
  {
    id: "gad7-4",
    instrument: "GAD-7",
    sectionLabel: "Тревога · GAD-7",
    prompt: GAD7_PROMPT,
    text: "Трудно расслабиться",
  },
  {
    id: "gad7-5",
    instrument: "GAD-7",
    sectionLabel: "Тревога · GAD-7",
    prompt: GAD7_PROMPT,
    text: "Такая неусидчивость, что трудно сидеть на месте",
  },
  {
    id: "gad7-6",
    instrument: "GAD-7",
    sectionLabel: "Тревога · GAD-7",
    prompt: GAD7_PROMPT,
    text: "Легко раздражаетесь или становитесь вспыльчивы",
  },
  {
    id: "gad7-7",
    instrument: "GAD-7",
    sectionLabel: "Тревога · GAD-7",
    prompt: GAD7_PROMPT,
    text: "Чувство страха, будто может случиться что-то ужасное",
  },
];

export type SeverityTone =
  | "none"
  | "mild"
  | "moderate"
  | "moderatelySevere"
  | "severe";

export type InstrumentResult = {
  instrument: QuestionnaireInstrument;
  title: string;
  score: number;
  max: number;
  band: 0 | 1 | 2 | 3 | 4;
  tone: SeverityTone;
  levelLabel: string;
  levelHint: string;
};

function sumInstrument(
  answers: Record<string, number | null>,
  instrument: QuestionnaireInstrument
): number {
  return QUESTIONNAIRE_QUESTIONS.filter((q) => q.instrument === instrument).reduce(
    (sum, q) => sum + (answers[q.id] ?? 0),
    0
  );
}

function phq9Level(score: number): Pick<
  InstrumentResult,
  "band" | "tone" | "levelLabel" | "levelHint"
> {
  if (score <= 4) {
    return {
      band: 0,
      tone: "none",
      levelLabel: "Минимальный уровень",
      levelHint: "Симптомы почти не выражены",
    };
  }
  if (score <= 9) {
    return {
      band: 1,
      tone: "mild",
      levelLabel: "Лёгкий уровень",
      levelHint: "Иногда заметно в повседневной жизни",
    };
  }
  if (score <= 14) {
    return {
      band: 2,
      tone: "moderate",
      levelLabel: "Умеренный уровень",
      levelHint: "Часто мешает сосредоточиться и отдыхать",
    };
  }
  if (score <= 19) {
    return {
      band: 3,
      tone: "severe",
      levelLabel: "Выраженный уровень",
      levelHint: "Сильно мешает в обычной жизни",
    };
  }
  return {
    band: 4,
    tone: "severe",
    levelLabel: "Тяжёлый уровень",
    levelHint: "Требует внимания специалиста",
  };
}

function gad7Level(score: number): Pick<
  InstrumentResult,
  "band" | "tone" | "levelLabel" | "levelHint"
> {
  if (score <= 4) {
    return {
      band: 0,
      tone: "none",
      levelLabel: "Минимальный уровень",
      levelHint: "Симптомы почти не выражены",
    };
  }
  if (score <= 9) {
    return {
      band: 1,
      tone: "mild",
      levelLabel: "Лёгкий уровень",
      levelHint: "Иногда заметно в повседневной жизни",
    };
  }
  if (score <= 14) {
    return {
      band: 2,
      tone: "moderate",
      levelLabel: "Умеренный уровень",
      levelHint: "Часто мешает сосредоточиться и отдыхать",
    };
  }
  return {
    band: 3,
    tone: "severe",
    levelLabel: "Выраженный уровень",
    levelHint: "Сильно мешает в обычной жизни",
  };
}

export function scoreQuestionnaires(
  answers: Record<string, number | null>
): { phq9: InstrumentResult; gad7: InstrumentResult } {
  const phq9Score = sumInstrument(answers, "PHQ-9");
  const gad7Score = sumInstrument(answers, "GAD-7");

  return {
    phq9: {
      instrument: "PHQ-9",
      title: "Настроение",
      score: phq9Score,
      max: 27,
      ...phq9Level(phq9Score),
    },
    gad7: {
      instrument: "GAD-7",
      title: "Тревога",
      score: gad7Score,
      max: 21,
      ...gad7Level(gad7Score),
    },
  };
}
