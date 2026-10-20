import type { TreatmentPlan } from '@/types/doctor'

/** Миронова — референс D07 плана лечения */
export const mironovaPlan: TreatmentPlan = {
  patientId: 'p1',
  shortName: 'Миронова Анна',
  initials: 'АМ',
  draftLabel: 'Черновик изменений',
  versionLabel: 'Версия 3 · от 11 окт',
  drug: {
    contourLabel: 'Рецептурный контур',
    title: 'Авиандр® 20 мг · 1 таблетка 2 раза в сутки',
    schedule: 'утром и вечером, за 30 минут до еды · курс с 11 октября',
    statusLabel: 'Активно',
    fields: [
      {
        id: 'dose',
        label: 'Дозировка',
        value: '20 мг',
        lock: 'locked',
      },
      {
        id: 'freq',
        label: 'Кратность',
        value: '2 раза в сутки',
        lock: 'locked',
      },
      {
        id: 'duration',
        label: 'Длительность',
        value: '6 недель · до 22 ноября',
        lock: 'editable',
      },
    ],
    validationNote:
      'Изменение длительности с 4 до 6 недель — в пределах зарегистрированных показаний ГРЛС. Дозировка без изменений.',
  },
  exercises: [
    {
      id: 'e1',
      title: 'Дыхание 4-7-8',
      status: 'new',
      statusLabel: 'Новое',
    },
    {
      id: 'e2',
      title: 'Дневник мыслей (КПТ)',
      status: 'active',
      statusLabel: 'Активно',
    },
    {
      id: 'e3',
      title: 'Прогулка 20 минут',
      status: 'active',
      statusLabel: 'Активно',
    },
  ],
  recommendations: [
    'Гигиена сна: отбой до 23:00, без экранов за час до сна',
    'Отказаться от алкоголя на период приёма Авиадра',
    'При усилении тревоги или суицидальных мыслей — сразу связаться с врачом',
  ],
  safety: [
    {
      id: 's1',
      tone: 'critical',
      priorityLabel: 'Обязательно',
      title: 'Сочетание с ингибиторами МАО противопоказано',
      historyLabel: 'В анамнезе: нет',
      historyOk: true,
    },
    {
      id: 's2',
      tone: 'warning',
      priorityLabel: 'Обязательно',
      title: 'Почечная / печёночная недостаточность',
      historyLabel: 'В анамнезе: нет',
      historyOk: true,
    },
    {
      id: 's3',
      tone: 'caution',
      priorityLabel: 'Желательно',
      title: 'Серотонинергические препараты',
      historyLabel: 'Учтено в плане',
      historyOk: true,
    },
    {
      id: 's4',
      tone: 'caution',
      priorityLabel: 'Желательно',
      title: 'Алкоголь',
      historyLabel: 'Рекомендация добавлена',
      historyOk: true,
    },
  ],
  consentDefault: true,
}

const plansByPatient: Record<string, TreatmentPlan> = {
  [mironovaPlan.patientId]: mironovaPlan,
}

export function getTreatmentPlan(patientId: string): TreatmentPlan | undefined {
  return plansByPatient[patientId]
}
