import type { ReportPreview } from '@/types/doctor'

/** Референс · предпросмотр отчёта (Миронова) */
export const mironovaReportPreview: ReportPreview = {
  patientId: 'p1',
  fullName: 'Миронова Анна Викторовна',
  periodLine: 'Период 4–18 октября · данные на 18 октября, 11:05',
  visitLine: 'Запланированный визит: 24 октября, 14:00',
  rows: [
    {
      id: 'phq9',
      indicator: 'PHQ-9',
      current: '14',
      previous: '17 · 4 октября',
    },
    {
      id: 'gad7',
      indicator: 'GAD-7',
      current: '12',
      previous: '12 · 4 октября',
    },
    {
      id: 'diary',
      indicator: 'Дневник',
      current: '12 из 14 дней · 86%',
      previous: '—',
    },
    {
      id: 'doses',
      indicator: 'Отметки приёма',
      current: '26 из 28 доз · 92%',
      previous: '—',
    },
  ],
  alert: {
    title: 'Незакрытый алерт',
    body: 'PHQ-9, вопрос 9: 1 балл. Клиническое решение ещё не сохранено.',
  },
  footerNote: 'Внутренняя заметка врача в документ не включена.',
}

const byPatient: Record<string, ReportPreview> = {
  p1: mironovaReportPreview,
}

export function getReportPreview(patientId: string): ReportPreview | undefined {
  return byPatient[patientId]
}
