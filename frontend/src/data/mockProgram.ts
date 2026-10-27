import type { PatientProgramTab } from '@/types/doctor'

/** Референс · вкладка «Программа» (Миронова) */
export const mironovaProgram: PatientProgramTab = {
  tasksTitle: 'Задания и выполнение',
  weekBadge: '44% за неделю',
  tasks: [
    {
      id: 't1',
      title: 'Дневник мыслей',
      subtitle: '3 раза в неделю · назначено в плане лечения',
      status: 'in_progress',
      statusLabel: 'В процессе',
    },
    {
      id: 't2',
      title: 'Прогулка 20 минут',
      subtitle: 'Ежедневно · отметки пациента за неделю',
      status: 'done',
      statusLabel: '5 из 7 выполнено',
    },
    {
      id: 't3',
      title: 'Дыхание 4-7-8',
      subtitle: 'Новое задание · параметры доступны в назначении',
      status: 'not_started',
      statusLabel: 'Не начато',
    },
  ],
  observation: {
    title: 'План наблюдения',
    body: 'Программа с 4 октября. Базовые назначения и параметры наблюдения зафиксированы в плане лечения.',
    cta: 'Открыть план лечения',
    ctaTone: 'soft',
  },
  addTask: {
    title: 'Добавить или уточнить задание',
    body: 'Материалы из библиотеки можно назначить пациенту без смены текущего плана лечения.',
    cta: 'Из библиотеки упражнений',
    ctaTone: 'primary',
  },
}

const byPatient: Record<string, PatientProgramTab> = {
  p1: mironovaProgram,
}

export function getPatientProgram(patientId: string): PatientProgramTab {
  return byPatient[patientId] ?? mironovaProgram
}
