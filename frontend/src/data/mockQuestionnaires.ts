import type { PatientQuestionnairesTab } from '@/types/doctor'

/** Референс D03 · вкладка «Опросники» (Миронова) */
export const mironovaQuestionnaires: PatientQuestionnairesTab = {
  summary: [
    {
      id: 'phq9',
      label: 'PHQ-9 · 18 октября',
      value: '14',
      footnote: '4 октября: 17 · вопрос 9: 1 балл',
    },
    {
      id: 'gad7',
      label: 'GAD-7 · 18 октября',
      value: '12',
      footnote: '4 октября: 12 · без изменений',
    },
    {
      id: 'next',
      label: 'Следующее заполнение',
      value: '1 ноября',
      footnote: 'По расписанию · через 2 недели',
    },
  ],
  historyTitle: 'История результатов',
  historyHint:
    'Результат принадлежит дате заполнения. Алерт не закрывается при просмотре.',
  history: [
    {
      id: 'h1',
      dateLabel: '18 октября · 10:42',
      phq9: 14,
      gad7: 12,
      q9Label: '1 балл · «Несколько дней»',
      q9Danger: true,
    },
    {
      id: 'h2',
      dateLabel: '4 октября · первичное',
      phq9: 17,
      gad7: 12,
      q9Label: '0 баллов · «Ни разу»',
    },
  ],
}

const byPatient: Record<string, PatientQuestionnairesTab> = {
  p1: mironovaQuestionnaires,
}

export function getPatientQuestionnaires(
  patientId: string,
): PatientQuestionnairesTab {
  return byPatient[patientId] ?? mironovaQuestionnaires
}
