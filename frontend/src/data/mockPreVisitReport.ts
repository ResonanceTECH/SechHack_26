import type { PreVisitReport } from '@/types/doctor'

/** Миронова — референс D05 отчёта перед визитом */
export const mironovaReport: PreVisitReport = {
  patientId: 'p1',
  shortName: 'Миронова Анна',
  initials: 'АМ',
  periodLabel: 'Период 4–18 октября',
  appointmentLabel: 'приём 24 октября, 14:00',
  generatedLabel: 'сформирован автоматически за 24 часа',
  metrics: [
    {
      id: 'phq9',
      label: 'PHQ-9',
      value: '14',
      footnote: 'было 17',
      badge: '↓ 3',
      badgeTone: 'success',
    },
    {
      id: 'gad7',
      label: 'GAD-7',
      value: '12',
      footnote: 'было 12',
      badge: 'без изм.',
      badgeTone: 'muted',
    },
    {
      id: 'diary',
      label: 'Дневник',
      value: '86%',
      footnote: '12 из 14 дней',
      badge: '2 пропуска',
      badgeTone: 'info',
    },
    {
      id: 'tasks',
      label: 'Задания',
      value: '44%',
      footnote: '4 из 9',
      badge: 'ниже цели',
      badgeTone: 'warning',
    },
    {
      id: 'aviandr',
      label: 'Авиандр',
      value: '92%',
      footnote: '26 из 28 доз',
      badge: 'рецепт',
      badgeTone: 'aviandr',
    },
  ],
  attention: [
    {
      id: 'a1',
      icon: 'trend',
      text: 'Настроение ≤ 2 и тревога ≥ 4 три дня подряд с 15 окт.',
      meta: 'Тренд дневника',
    },
    {
      id: 'a2',
      icon: 'alert',
      text: 'PHQ-9 вопрос 9 = 1 балл. Алерт закрыт врачом 16 окт.',
      meta: 'Суицидальный скрининг',
    },
    {
      id: 'a3',
      icon: 'pill',
      text: 'Сонливость упомянута дважды. Побочные от Авиандра.',
      meta: 'Переносимость',
    },
    {
      id: 'a4',
      icon: 'calendar',
      text: 'Курс 4 недели заканчивается 8 ноября.',
      meta: 'Срок терапии',
    },
  ],
  sleep: {
    title: 'Сон и энергия · 14 дней',
    days: [
      { id: 'd1', tone: 'ok' },
      { id: 'd2', tone: 'ok' },
      { id: 'd3', tone: 'bad' },
      { id: 'd4', tone: 'ok' },
      { id: 'd5', tone: 'hard' },
      { id: 'd6', tone: 'empty' },
      { id: 'd7', tone: 'ok' },
      { id: 'd8', tone: 'ok' },
      { id: 'd9', tone: 'bad' },
      { id: 'd10', tone: 'bad' },
      { id: 'd11', tone: 'ok' },
      { id: 'd12', tone: 'hard' },
      { id: 'd13', tone: 'ok' },
      { id: 'd14', tone: 'ok' },
    ],
  },
  questions: [
    {
      id: 'q1',
      text: 'Сонливость днём — это нормально на Авиандре?',
    },
    {
      id: 'q2',
      text: 'Можно ли пить кофе утром?',
    },
  ],
  alerts: [
    {
      id: 'al1',
      priority: 'mandatory',
      title: 'PHQ-9 п.9 = 1',
      when: '16 окт, 09:12',
    },
    {
      id: 'al2',
      priority: 'optional',
      title: '3 дня сниженного настроения',
      when: '15 окт, 21:40',
    },
  ],
  notes:
    'Обсудить сон, гигиену сна. Решить вопрос о продлении курса до 6 недель. Повторить PHQ-9/GAD-7.',
}

const reportsByPatient: Record<string, PreVisitReport> = {
  [mironovaReport.patientId]: mironovaReport,
}

export function getPreVisitReport(patientId: string): PreVisitReport | undefined {
  return reportsByPatient[patientId]
}
