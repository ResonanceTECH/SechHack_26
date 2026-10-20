import type {
  ExerciseAssignPatient,
  ExerciseCategory,
  ExerciseItem,
} from '@/types/doctor'

export const exercisesMeta = {
  totalCount: 24,
  subtitle:
    'КПТ и поведенческая активация · 24 материала · можно назначить из карточки пациента',
} as const

export const exerciseFilters: Array<{
  id: ExerciseCategory | 'all'
  label: string
}> = [
  { id: 'all', label: 'Все' },
  { id: 'breathing', label: 'Дыхание' },
  { id: 'thought_diary', label: 'Дневник мыслей' },
  { id: 'behavioral', label: 'Поведенческая активация' },
  { id: 'relaxation', label: 'Релаксация' },
]

/** Референс D06 — библиотека + назначение Мироновой */
export const assignPatientDefault: ExerciseAssignPatient = {
  id: 'p1',
  shortName: 'Миронова Анна',
  initials: 'АМ',
  age: 34,
  programLabel: 'программа: неделя 2 из 6',
}

export const exercises: ExerciseItem[] = [
  {
    id: 'ex-478',
    title: 'Дыхание 4-7-8',
    category: 'breathing',
    categoryLabel: 'Дыхание',
    durationMin: 5,
    description:
      'Короткое упражнение для снижения тревоги перед сном и в моменты пика.',
    icon: 'lungs',
    iconTone: 'blue',
  },
  {
    id: 'ex-box',
    title: 'Квадратное дыхание',
    category: 'breathing',
    categoryLabel: 'Дыхание',
    durationMin: 4,
    description:
      'Равный цикл вдох–задержка–выдох–задержка. Стабилизирует дыхание за 3–4 минуты.',
    icon: 'heart',
    iconTone: 'rose',
  },
  {
    id: 'ex-diary',
    title: 'Дневник мыслей',
    category: 'thought_diary',
    categoryLabel: 'Дневник мыслей',
    durationMin: 10,
    description:
      'Запись автоматических мыслей, эмоций и альтернативных формулировок по схеме КПТ.',
    icon: 'notebook',
    iconTone: 'amber',
  },
  {
    id: 'ex-pleasant',
    title: 'Планирование приятных дел',
    category: 'behavioral',
    categoryLabel: 'Поведенческая активация',
    durationMin: 15,
    description:
      'Выбор и планирование 1–2 доступных активностей на ближайшие дни.',
    icon: 'calendar',
    iconTone: 'green',
  },
  {
    id: 'ex-pmr',
    title: 'Мышечная релаксация',
    category: 'relaxation',
    categoryLabel: 'Релаксация',
    durationMin: 12,
    description:
      'Поочерёдное напряжение и расслабление групп мышц для снижения телесного напряжения.',
    icon: 'leaf',
    iconTone: 'teal',
  },
  {
    id: 'ex-walk',
    title: 'Прогулка 20 минут',
    category: 'behavioral',
    categoryLabel: 'Поведенческая активация',
    durationMin: 20,
    description:
      'Лёгкая прогулка без гаджетов. Фокус на телесных ощущениях и темпе шага.',
    icon: 'walk',
    iconTone: 'violet',
  },
]

export const assignDefaults = {
  frequency: 'daily' as const,
  reminders: ['morning', 'evening'] as const,
  startDate: '18.10.2026',
  endDate: '08.11.2026',
  comment:
    'Делайте утром и перед сном, особенно когда тревога выше 3.',
  pushNote:
    'Пациент получит push-уведомление с напоминанием и коротким описанием упражнения.',
}
