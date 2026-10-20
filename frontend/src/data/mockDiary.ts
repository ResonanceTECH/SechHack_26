import { mironovaCard } from '@/data/mockPatientCard'
import type { PatientDiaryTab } from '@/types/doctor'

/** Референс · вкладка «Дневник» (Миронова) */
export const mironovaDiary: PatientDiaryTab = {
  chartTitle: 'Дневник · 30 дней',
  chartFootnote:
    'Серые полосы — пропуски · красная зона — ухудшение 3 дня подряд',
  points: mironovaCard.diary.points,
  lastEntry: {
    title: 'Последняя запись · 18 октября',
    sourceBadge: 'Из приложения',
    metrics: [
      { id: 'mood', label: 'Настроение', value: '2 из 5' },
      { id: 'anxiety', label: 'Тревога', value: '4 из 5' },
      {
        id: 'sleep',
        label: 'Сон',
        value: 'Отдельная оценка не указана',
      },
    ],
  },
  fill: {
    title: 'Заполнение · 4–18 октября',
    percent: '86%',
    detail: '12 из 14 дней · 2 пропуска',
    weekNote:
      'За 7 дней: Сон в среднем около 5,5 ч. Пробуждения — 4 из 7 ночей.',
  },
  message: {
    statusLabel: 'Требует оценки',
    title: 'Сыпь и зуд с 17 октября',
    body: 'Сообщение с фото. Решение по терапии ещё не сохранено.',
    cta: 'Оценить сообщение',
  },
}

const byPatient: Record<string, PatientDiaryTab> = {
  p1: mironovaDiary,
}

export function getPatientDiary(patientId: string): PatientDiaryTab {
  return byPatient[patientId] ?? mironovaDiary
}
