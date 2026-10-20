import type { ChatThread, DialogListItem } from '@/types/doctor'

export const dialogList: DialogListItem[] = [
  {
    id: 'd1',
    patientId: 'p1',
    patientShortName: 'Миронова А.',
    patientFullName: 'Миронова Анна',
    initials: 'АМ',
    avatarTone: 'rose',
    preview: 'Фото — сыпь на руках',
    timeLabel: '10:12',
    unread: 2,
  },
  {
    id: 'd2',
    patientId: 'p2',
    patientShortName: 'Кузнецов И.',
    patientFullName: 'Кузнецов Игорь',
    initials: 'ИК',
    avatarTone: 'amber',
    preview: 'Скрининг готов, спасибо',
    timeLabel: 'вчера',
  },
  {
    id: 'd3',
    patientId: 'p4',
    patientShortName: 'Белова О.',
    patientFullName: 'Белова Ольга',
    initials: 'ОБ',
    avatarTone: 'green',
    preview: 'Пропустила 2 дня дневника…',
    timeLabel: 'пт',
  },
  {
    id: 'd4',
    patientId: 'p3',
    patientShortName: 'Соколова Д.',
    patientFullName: 'Соколова Дарья',
    initials: 'ДС',
    avatarTone: 'blue',
    preview: 'Когда следующий визит?',
    timeLabel: 'пт',
  },
]

export const chatThreads: Record<string, ChatThread> = {
  p1: {
    patientId: 'p1',
    patientFullName: 'Миронова Анна',
    subtitle: 'Авиандр 20 мг · алерт: возможная реакция',
    messages: [
      {
        id: 'm1',
        kind: 'incoming',
        text: 'Со вчера сыпь на руках, чешется',
        photo: true,
      },
      {
        id: 'm2',
        kind: 'system',
        text: 'Извлечено из сообщения: сыпь, зуд · создано нежелательное явление',
        ctaLabel: 'Открыть',
        ctaTo: '/alerts/a2',
      },
      {
        id: 'm3',
        kind: 'outgoing',
        text: 'Анна, спасибо. Вечернюю таблетку пока не принимайте — позвоню вам в 15:00.',
      },
    ],
    quickReplies: [
      'Позвоню сегодня',
      'Запишу на приём раньше',
      'Пройдите опросник',
    ],
    footerNote:
      'Сообщения сохраняются в карточке. Не используется для экстренной связи — у пациента есть SOS.',
  },
  p2: {
    patientId: 'p2',
    patientFullName: 'Кузнецов Игорь',
    subtitle: 'БАР I · скрининг HCL-32',
    messages: [
      {
        id: 'm1',
        kind: 'incoming',
        text: 'Скрининг готов, спасибо',
      },
      {
        id: 'm2',
        kind: 'outgoing',
        text: 'Игорь, спасибо. Разберу результаты к приёму сегодня.',
      },
    ],
    quickReplies: ['Напомню про приём', 'Запросить опросник'],
    footerNote:
      'Сообщения сохраняются в карточке. Не используется для экстренной связи — у пациента есть SOS.',
  },
  p4: {
    patientId: 'p4',
    patientFullName: 'Белова Ольга',
    subtitle: 'Депрессивный эпизод · дневник',
    messages: [
      {
        id: 'm1',
        kind: 'incoming',
        text: 'Пропустила 2 дня дневника, извините',
      },
    ],
    quickReplies: ['Ничего страшного', 'Пройдите опросник'],
    footerNote:
      'Сообщения сохраняются в карточке. Не используется для экстренной связи — у пациента есть SOS.',
  },
  p3: {
    patientId: 'p3',
    patientFullName: 'Соколова Дарья',
    subtitle: 'Депрессия · следующий визит',
    messages: [
      {
        id: 'm1',
        kind: 'incoming',
        text: 'Когда следующий визит?',
      },
      {
        id: 'm2',
        kind: 'outgoing',
        text: 'Дарья, следующий визит — сегодня в 11:30.',
      },
    ],
    quickReplies: ['Подтверждаю время', 'Перенесём приём'],
    footerNote:
      'Сообщения сохраняются в карточке. Не используется для экстренной связи — у пациента есть SOS.',
  },
}

export function getDialogByPatientId(patientId: string): DialogListItem | null {
  return dialogList.find((d) => d.patientId === patientId) ?? null
}

export function getChatThread(patientId: string): ChatThread | null {
  return chatThreads[patientId] ?? null
}
