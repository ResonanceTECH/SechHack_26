import type { PreVisitReportsList } from '@/types/doctor'

/** Референс · список отчётов перед визитами */
export const preVisitReportsList: PreVisitReportsList = {
  title: 'Отчёты перед визитами',
  subtitle:
    'Выберите визит, чтобы открыть отчёт с доступными данными пациента.',
  footer:
    'Отчёты обновлены 18 октября, 11:05. Просмотр отчёта не закрывает алерты и не меняет назначения.',
  weekRangeLabel: '18–24 октября · 5 визитов',
  todayRangeLabel: '18 октября · 4 визита',
  rows: [
    {
      id: 'r1',
      patientId: 'p2',
      patientName: 'Кузнецов Игорь',
      visitKind: 'Повторный · очно',
      visitAt: '18 окт · 10:00',
      visitDate: '2026-10-18',
      readiness: 'ready',
      readinessLabel: 'Готов',
      attention: { label: 'Алерт по скринингу', tone: 'danger' },
    },
    {
      id: 'r2',
      patientId: 'p3',
      patientName: 'Лебедева Наталья',
      visitKind: 'Первичный · видео',
      visitAt: '18 окт · 11:30',
      visitDate: '2026-10-18',
      readiness: 'ready',
      readinessLabel: 'Готов',
      attention: { label: 'Первичный приём', tone: 'plain' },
    },
    {
      id: 'r3',
      patientId: 'p4',
      patientName: 'Белова Ольга',
      visitKind: 'Повторный · очно',
      visitAt: '18 окт · 15:30',
      visitDate: '2026-10-18',
      readiness: 'low_data',
      readinessLabel: 'Мало данных',
      attention: { label: 'Пропуски дневника', tone: 'warning' },
    },
    {
      id: 'r4',
      patientId: 'p5',
      patientName: 'Орлов Виктор',
      visitKind: 'Повторный · видео',
      visitAt: '18 окт · 17:00',
      visitDate: '2026-10-18',
      readiness: 'ready',
      readinessLabel: 'Готов',
      attention: { label: '—', tone: 'none' },
    },
    {
      id: 'r5',
      patientId: 'p1',
      patientName: 'Миронова Анна',
      visitKind: 'Повторный · очно',
      visitAt: '24 окт · 14:00',
      visitDate: '2026-10-24',
      readiness: 'ready',
      readinessLabel: 'Готов',
      attention: { label: 'Незакрытый алерт', tone: 'danger' },
    },
  ],
}
