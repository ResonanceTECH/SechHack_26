import type {
  AppointmentItem,
  AttentionItem,
  DoctorProfile,
  StatCardData,
} from '@/types/doctor'

export const doctorProfile: DoctorProfile = {
  fullName: 'Елена Сергеевна',
  shortName: 'Смирнова Е. С.',
  initials: 'ЕС',
  specialty: 'Врач-психиатр',
}

export const dashboardStats: StatCardData[] = [
  {
    id: 'patients',
    title: 'Активных пациентов',
    value: '24',
    hint: '+3 за неделю',
    tone: 'brand',
  },
  {
    id: 'alerts',
    title: 'Новых алертов',
    value: '3',
    hint: '3 обязательных · 1 желательный',
    tone: 'danger',
  },
  {
    id: 'appointments',
    title: 'Приёмов сегодня',
    value: '5',
    hint: 'Следующий в 14:00',
    tone: 'success',
  },
  {
    id: 'reaction',
    title: 'Медианное время реакции',
    value: '18 мин',
    hint: 'Цель ≤ 30 мин',
    tone: 'warning',
  },
]

export const attentionItems: AttentionItem[] = [
  {
    id: '1',
    patientName: 'Миронова Анна',
    age: 34,
    diagnosis: 'БАР II',
    title: 'Суицидальный риск: PHQ-9 п.9…',
    meta: 'Сегодня · 09:12',
    priority: 'mandatory',
    critical: true,
  },
  {
    id: '2',
    patientName: 'Миронова Анна',
    age: 34,
    diagnosis: 'БАР II',
    title: 'Сыпь и зуд по фото…',
    meta: 'Сегодня · 08:40',
    priority: 'mandatory',
    tags: ['Рецепт'],
  },
  {
    id: '3',
    patientName: 'Кузнецов Игорь',
    age: 41,
    diagnosis: 'БАР I',
    title: 'Скрининг гипомании…',
    meta: 'Вчера · 21:05',
    priority: 'mandatory',
  },
  {
    id: '4',
    patientName: 'Белова Ольга',
    age: 29,
    diagnosis: 'Депрессивный эпизод',
    title: 'Пропущено 5 записей дневника…',
    meta: 'Вчера · 18:20',
    priority: 'optional',
  },
]

export const appointmentsToday: AppointmentItem[] = [
  {
    id: 'a1',
    time: '10:00',
    patientName: 'Кузнецов И.',
    reportSurname: 'Кузнецова',
    kind: 'Повторный',
    format: 'Очно',
    status: 'report_ready',
  },
  {
    id: 'a2',
    time: '11:30',
    patientName: 'Соколова М.',
    reportSurname: 'Соколовой',
    kind: 'Первичный',
    format: 'Видео',
    status: 'screening_done',
  },
  {
    id: 'a3',
    time: '14:00',
    patientName: 'Миронова А.',
    reportSurname: 'Мироновой',
    kind: 'Повторный',
    format: 'Очно',
    status: 'has_alert',
  },
  {
    id: 'a4',
    time: '15:30',
    patientName: 'Белова О.',
    reportSurname: 'Беловой',
    kind: 'Повторный',
    format: 'Очно',
    status: 'low_data',
  },
  {
    id: 'a5',
    time: '17:00',
    patientName: 'Орлов Д.',
    reportSurname: 'Орлова',
    kind: 'Первичный',
    format: 'Видео',
    status: 'screening_done',
  },
]
