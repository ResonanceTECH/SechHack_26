import { patients } from '@/data/mockPatients'
import type { PatientCard, PatientRow } from '@/types/doctor'

/** Миронова — референс D03 карточки пациента */
export const mironovaCard: PatientCard = {
  id: 'p1',
  fullName: 'Миронова Анна Викторовна',
  shortName: 'Миронова Анна',
  initials: 'АМ',
  age: 34,
  diagnosisCode: 'ГТР (F41.1)',
  inProgramSince: '4 октября',
  leadDoctor: 'Смирнова Е. С.',
  badges: [
    { id: 'critical', label: 'Критично', tone: 'critical' },
    {
      id: 'appointment',
      label: 'Приём 24 окт, 14:00',
      tone: 'appointment',
      withCalendar: true,
    },
  ],
  alert: {
    id: 'a1',
    priorityLabel: 'Обязательно · алерт не закрыт',
    title: 'PHQ-9, вопрос 9: «Несколько дней» (1 балл)',
    body: 'сегодня в 10:42 · пациенту показан план безопасности',
    cta: 'Открыть алерт',
  },
  diary: {
    title: 'Дневник · 30 дней',
    footnote:
      'Серые полосы = пропуски · красная зона = ухудшение 3 дня подряд',
    points: [
      { day: 1, mood: 6.2, anxiety: 5.8, sleep: 6.5 },
      { day: 2, mood: 5.8, anxiety: 6.2, sleep: 6.0 },
      { day: 3, mood: 5.2, anxiety: 6.8, sleep: 5.4, worsenZone: true },
      { day: 4, mood: 4.6, anxiety: 7.4, sleep: 4.8, worsenZone: true },
      { day: 5, mood: 4.2, anxiety: 7.8, sleep: 4.5, worsenZone: true },
      { day: 6, mood: null, anxiety: null, sleep: null, gap: true },
      { day: 7, mood: null, anxiety: null, sleep: null, gap: true },
      { day: 8, mood: 5.0, anxiety: 6.5, sleep: 5.8 },
      { day: 9, mood: 5.6, anxiety: 6.0, sleep: 6.2 },
      { day: 10, mood: 6.0, anxiety: 5.5, sleep: 6.8 },
      { day: 11, mood: 6.4, anxiety: 5.2, sleep: 7.0 },
      { day: 12, mood: 5.9, anxiety: 5.8, sleep: 6.4 },
      { day: 13, mood: 5.4, anxiety: 6.4, sleep: 5.9 },
      { day: 14, mood: null, anxiety: null, sleep: null, gap: true },
      { day: 15, mood: 6.1, anxiety: 5.6, sleep: 6.5 },
      { day: 16, mood: 6.8, anxiety: 5.0, sleep: 7.2 },
      { day: 17, mood: 7.0, anxiety: 4.8, sleep: 7.4 },
      { day: 18, mood: 6.5, anxiety: 5.4, sleep: 6.8 },
      { day: 19, mood: 5.8, anxiety: 6.2, sleep: 6.0 },
      { day: 20, mood: 5.2, anxiety: 6.9, sleep: 5.5, worsenZone: true },
      { day: 21, mood: 4.8, anxiety: 7.2, sleep: 5.0, worsenZone: true },
      { day: 22, mood: 4.5, anxiety: 7.5, sleep: 4.6, worsenZone: true },
      { day: 23, mood: null, anxiety: null, sleep: null, gap: true },
      { day: 24, mood: 5.5, anxiety: 6.3, sleep: 5.8 },
      { day: 25, mood: 6.2, anxiety: 5.7, sleep: 6.4 },
      { day: 26, mood: 6.8, anxiety: 5.1, sleep: 7.0 },
      { day: 27, mood: 7.2, anxiety: 4.6, sleep: 7.3 },
      { day: 28, mood: 6.9, anxiety: 4.9, sleep: 7.1 },
      { day: 29, mood: 6.4, anxiety: 5.3, sleep: 6.6 },
      { day: 30, mood: 6.0, anxiety: 5.8, sleep: 6.2 },
    ],
  },
  questionnaires: [
    {
      id: 'phq9',
      code: 'PHQ-9',
      score: 14,
      max: 27,
      previous: 17,
      trend: 'down',
      trendLabel: '↓ 3 · улучшение',
      dates: ['4 окт', '18 окт'],
      bars: [17, 14],
      note: 'Вопрос 9 PHQ-9: 0 → 1 балл',
    },
    {
      id: 'gad7',
      code: 'GAD-7',
      score: 12,
      max: 21,
      previous: 12,
      trend: 'same',
      trendLabel: 'без изменений',
      dates: ['4 окт', '18 окт'],
      bars: [12, 12],
    },
  ],
  program: {
    title: 'Программа',
    weekProgress: 44,
    weekLabel: '44% за неделю',
    tasks: [
      {
        id: 't1',
        title: 'Дыхание 4-7-8',
        status: 'not_started',
        statusLabel: 'не начато',
      },
      {
        id: 't2',
        title: 'Дневник мыслей',
        status: 'in_progress',
        statusLabel: 'в процессе',
      },
      {
        id: 't3',
        title: 'Прогулка 20 минут',
        status: 'done',
        statusLabel: 'выполнено',
        progressLabel: '5/7',
      },
    ],
  },
  medication: {
    id: 'm1',
    name: 'Авиандр',
    dose: '20 мг',
    schedule: '2 раза в день',
    adherence: 92,
    sideEffects: 'сонливость ×2',
    warnings: 'обязательных нет',
    contourLabel: 'Рецептурный контур',
  },
  summary: {
    title: 'Сводка системы · 7 дней',
    body: 'Настроение ≤ 2 и тревога ≥ 4 три дня подряд. Сон ~5.5 ч, ранние пробуждения. Пациентка отмечает зуд кожи. Приверженность Авиандру высокая (92%).',
    basedOn: 'Основано на 14 записях',
    decisionNote: 'Решение — за врачом',
  },
}

function trendLabel(
  trend: PatientRow['phq9']['trend'],
  current: number,
  previous: number,
): string {
  const delta = Math.abs(current - previous)
  if (trend === 'same') return 'без изменений'
  if (trend === 'down') return `↓ ${delta} · улучшение`
  return `↑ ${delta} · ухудшение`
}

function cardFromRow(row: PatientRow): PatientCard {
  const badges: PatientCard['badges'] = []
  if (row.status === 'critical') {
    badges.push({ id: 'critical', label: 'Критично', tone: 'critical' })
  } else if (row.status === 'attention') {
    badges.push({ id: 'attention', label: 'Внимание', tone: 'info' })
  } else if (row.status === 'new') {
    badges.push({ id: 'new', label: 'Новый', tone: 'info' })
  } else {
    badges.push({ id: 'stable', label: 'Стабильно', tone: 'info' })
  }
  if (row.aviandrPercent != null) {
    badges.push({ id: 'aviandr', label: 'Принимает Авиа', tone: 'aviandr' })
  }

  return {
    id: row.id,
    fullName: row.name,
    shortName: row.name,
    initials: row.initials,
    age: row.age,
    diagnosisCode: row.diagnosis,
    inProgramSince: '—',
    leadDoctor: 'Смирнова Е. С.',
    badges,
    alert: null,
    diary: {
      title: 'Дневник · 30 дней',
      footnote:
        'Серые полосы = пропуски · красная зона = ухудшение 3 дня подряд',
      points: mironovaCard.diary.points,
    },
    questionnaires: [
      {
        id: 'phq9',
        code: 'PHQ-9',
        score: row.phq9.value,
        max: 27,
        previous: row.phq9.previous,
        trend: row.phq9.trend,
        trendLabel: trendLabel(row.phq9.trend, row.phq9.value, row.phq9.previous),
        dates: ['4 окт', '18 окт'],
        bars: [row.phq9.previous, row.phq9.value],
      },
      {
        id: 'gad7',
        code: 'GAD-7',
        score: row.gad7.value,
        max: 21,
        previous: row.gad7.previous,
        trend: row.gad7.trend,
        trendLabel: trendLabel(row.gad7.trend, row.gad7.value, row.gad7.previous),
        dates: ['4 окт', '18 окт'],
        bars: [row.gad7.previous, row.gad7.value],
      },
    ],
    program: mironovaCard.program,
    medication:
      row.aviandrPercent == null
        ? null
        : {
            ...mironovaCard.medication!,
            adherence: row.aviandrPercent,
          },
    summary: {
      title: 'Сводка системы · 7 дней',
      body: `Краткая сводка по пациенту ${row.name}. Данные дневника и опросников за последние 7 дней.`,
      basedOn: 'Основано на записях дневника',
      decisionNote: 'Решение — за врачом',
    },
  }
}

const detailed: Record<string, PatientCard> = {
  [mironovaCard.id]: mironovaCard,
}

export function getPatientCard(id: string): PatientCard | undefined {
  if (detailed[id]) return detailed[id]
  const row = patients.find((p) => p.id === id)
  return row ? cardFromRow(row) : undefined
}
