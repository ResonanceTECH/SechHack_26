import type { PatientVisitsTab } from '@/types/doctor'

/** Референс · вкладка «Визиты и заметки» (Миронова) */
export const mironovaVisits: PatientVisitsTab = {
  appointment: {
    statusLabel: 'Запланирован',
    datetime: '24 октября · 14:00',
    kindLine: 'Повторный приём · очно',
    doctorLine: 'Ведущий врач: Смирнова Е. С.',
    reportCta: 'Открыть отчёт',
    transferTitle: 'Перенос не подтверждён',
    transferBody:
      'Подготовлен перенос на 20 октября, 11:00. Требуется подтверждение врача — изменения ещё не сохранены.',
    alertCta: 'Перейти к алерту',
  },
  note: {
    title: 'Заметка к приёму',
    body: 'Обсудить сон, гигиену сна. Решить вопрос о продлении курса до 6 недель. Повторить PHQ-9/GAD-7.',
    disclaimer: 'Внутренняя заметка врача · пациенту не отправляется',
    editCta: 'Редактировать заметку',
  },
  historyTitle: 'История клинических записей',
  history: [
    {
      id: 'h1',
      dateLabel: '11 октября',
      text: 'План лечения · версия 3. Начало текущего курса.',
      actionLabel: 'План лечения',
      action: 'plan',
    },
    {
      id: 'h2',
      dateLabel: '4 октября',
      text: 'Начало наблюдения · первичные PHQ-9 и GAD-7.',
      actionLabel: 'Опросники',
      action: 'questionnaires',
    },
  ],
}

const byPatient: Record<string, PatientVisitsTab> = {
  p1: mironovaVisits,
}

export function getPatientVisits(patientId: string): PatientVisitsTab {
  return byPatient[patientId] ?? mironovaVisits
}
