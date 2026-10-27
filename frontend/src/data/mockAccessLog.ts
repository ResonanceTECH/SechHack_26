import type { PatientAccessTab } from '@/types/doctor'

/** Референс · вкладка «Журнал доступа» (Миронова) */
export const mironovaAccess: PatientAccessTab = {
  title: 'Журнал доступа и действий',
  subtitle:
    'События этой карточки · московское время. Записи журнала нельзя изменить или удалить.',
  viewOnlyBadge: 'Только просмотр',
  rows: [
    {
      id: 'r1',
      time: '18 окт · 11:05',
      who: 'Смирнова Е. С.',
      action: 'Просмотр карточки пациента',
      basis: 'Ведущий врач',
    },
    {
      id: 'r2',
      time: '18 окт · 10:42',
      who: 'Система',
      action: 'Получен PHQ-9 · создан обязательный алерт',
      basis: 'Автоматически',
    },
    {
      id: 'r3',
      time: '18 окт · 10:12',
      who: 'Система',
      action: 'Получено сообщение о симптомах с фото',
      basis: 'Из приложения',
    },
    {
      id: 'r4',
      time: '11 окт',
      who: 'Смирнова Е. С.',
      action: 'Сохранён план лечения · версия 3',
      basis: 'Ведущий врач',
    },
  ],
  viewer: {
    initials: 'ЕС',
    fullName: 'Смирнова Елена Сергеевна',
    roleLine: 'Ведущий врач пациента · клиника «Равновесие»',
    accessBadge: 'Доступ к клиническим данным',
    footerNote:
      'Назначение врача и изменение прав выполняет администратор клиники. Роль администратора сама по себе не даёт доступ к медицинской карте.',
  },
}

const byPatient: Record<string, PatientAccessTab> = {
  p1: mironovaAccess,
}

export function getPatientAccessLog(patientId: string): PatientAccessTab {
  return byPatient[patientId] ?? mironovaAccess
}
