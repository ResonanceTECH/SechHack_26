import type {
  AdverseEventAlert,
  AlertDetail,
  AlertQueueItem,
} from '@/types/doctor'

export const alertQueue: AlertQueueItem[] = [
  {
    id: 'a1',
    patientId: 'p1',
    patientShortName: 'Миронова А.',
    patientFullName: 'Миронова Анна',
    patientAge: 34,
    initials: 'АМ',
    avatarTone: 'rose',
    timeLabel: '10:42',
    summary: 'Суицидальный риск · умеренный',
    priority: 'mandatory',
    tab: 'new',
    selectedTone: 'critical',
  },
  {
    id: 'a2',
    patientId: 'p1',
    patientShortName: 'Миронова А.',
    patientFullName: 'Миронова Анна',
    patientAge: 34,
    initials: 'АМ',
    avatarTone: 'rose',
    timeLabel: '10:12',
    summary: 'Сыпь и зуд · фото + текст',
    priority: 'mandatory',
    tab: 'new',
    detailRoute: '/alerts/a2',
  },
  {
    id: 'a3',
    patientId: 'p2',
    patientShortName: 'Кузнецов И.',
    patientFullName: 'Кузнецов Игорь',
    patientAge: 41,
    initials: 'КИ',
    avatarTone: 'amber',
    timeLabel: 'Вчера',
    summary: 'Скрининг гипомании · HCL-32',
    priority: 'mandatory',
    tab: 'new',
  },
  {
    id: 'a4',
    patientId: 'p4',
    patientShortName: 'Белова О.',
    patientFullName: 'Белова Ольга',
    patientAge: 29,
    initials: 'БО',
    avatarTone: 'green',
    timeLabel: '2 дня назад',
    summary: 'Пропуски дневника · 5 дней',
    priority: 'optional',
    tab: 'new',
  },
]

export const alertDetails: Record<string, AlertDetail> = {
  a1: {
    id: 'a1',
    priority: 'mandatory',
    statusChip: 'Новый · ждёт реакции 23 мин из 30',
    title: 'Критический ответ в опроснике — Миронова Анна, 34',
    meta: 'Тип: critical_symptom · Источник: скрининг PHQ-9 · Правило: PHQ-9 п.9 ≥ 1 при депрессии',
    dataRows: [
      {
        id: 'd1',
        label: 'PHQ-9 п.9 (суицидальные мысли)',
        value: '1 балл',
        valueTone: 'danger',
      },
      {
        id: 'd2',
        label: 'PHQ-9 суммарно',
        value: '14',
      },
      {
        id: 'd3',
        label: 'GAD-7 суммарно',
        value: '12',
      },
      {
        id: 'd4',
        label: 'Дневник (последние 7 дней)',
        value: 'Настроение 2 · Тревога 4',
        valueTone: 'warning',
      },
      {
        id: 'd5',
        label: 'Авиандр 20 мг',
        value: 'приверженность 92%',
        valueTone: 'brand',
      },
    ],
    timeline: [
      {
        id: 't1',
        time: '10:42',
        text: 'Создан алерт (critical_symptom)',
        tone: 'done',
      },
      {
        id: 't2',
        time: '10:42',
        text: 'Push/Email врачу · ожидание реакции до 11:12',
        tone: 'done',
      },
      {
        id: 't3',
        time: '10:43',
        text: 'Пациенту показан safety plan в приложении',
        tone: 'done',
      },
      {
        id: 't4',
        text: 'Ждёт: врач принимает алерт в работу',
        tone: 'pending',
      },
    ],
    routing: [
      {
        id: 'earlier_visit',
        title: 'Очная консультация раньше срока',
        subtitle: 'перенести приём на 20 окт',
      },
      {
        id: 'emergency',
        title: 'Экстренная помощь / госпитализация',
      },
      {
        id: 'observe',
        title: 'Наблюдение · усилить мониторинг',
      },
    ],
    commentDefault:
      'Созвонилась с пациенткой. Риск умеренный, есть план безопасности. Направила на очный приём 20 окт.',
    riskDefault: 'medium',
    routingDefault: 'earlier_visit',
  },
  a2: {
    id: 'a2',
    priority: 'mandatory',
    statusChip: 'Новый · ждёт реакции 18 мин из 30',
    title: 'Побочная реакция на препарат — Миронова Анна, 34',
    meta: 'Тип: side_effect · Источник: дневник + фото · Правило: сыпь/зуд при Авиандр',
    dataRows: [
      {
        id: 'd1',
        label: 'Жалоба',
        value: 'Сыпь и зуд (фото)',
        valueTone: 'danger',
      },
      {
        id: 'd2',
        label: 'Авиандр 20 мг',
        value: 'день 12 терапии',
      },
      {
        id: 'd3',
        label: 'Приверженность',
        value: '92%',
        valueTone: 'brand',
      },
    ],
    timeline: [
      {
        id: 't1',
        time: '10:12',
        text: 'Создан алерт (side_effect)',
        tone: 'done',
      },
      {
        id: 't2',
        time: '10:12',
        text: 'Push/Email врачу',
        tone: 'done',
      },
      {
        id: 't3',
        text: 'Ждёт: врач принимает алерт в работу',
        tone: 'pending',
      },
    ],
    routing: [
      {
        id: 'earlier_visit',
        title: 'Очная консультация раньше срока',
        subtitle: 'перенести приём на 20 окт',
      },
      {
        id: 'emergency',
        title: 'Экстренная помощь / госпитализация',
      },
      {
        id: 'observe',
        title: 'Наблюдение · усилить мониторинг',
      },
    ],
    commentDefault: '',
    riskDefault: 'medium',
    routingDefault: 'earlier_visit',
  },
  a3: {
    id: 'a3',
    priority: 'mandatory',
    statusChip: 'Новый · ждёт реакции',
    title: 'Скрининг гипомании — Кузнецов Игорь, 41',
    meta: 'Тип: screening · Источник: HCL-32 · Правило: порог гипомании',
    dataRows: [
      {
        id: 'd1',
        label: 'HCL-32',
        value: 'выше порога',
        valueTone: 'danger',
      },
      {
        id: 'd2',
        label: 'Диагноз',
        value: 'БАР I',
      },
    ],
    timeline: [
      {
        id: 't1',
        time: 'Вчера',
        text: 'Создан алерт (screening)',
        tone: 'done',
      },
      {
        id: 't2',
        text: 'Ждёт: врач принимает алерт в работу',
        tone: 'pending',
      },
    ],
    routing: [
      {
        id: 'earlier_visit',
        title: 'Очная консультация раньше срока',
      },
      {
        id: 'emergency',
        title: 'Экстренная помощь / госпитализация',
      },
      {
        id: 'observe',
        title: 'Наблюдение · усилить мониторинг',
      },
    ],
    commentDefault: '',
    riskDefault: 'medium',
    routingDefault: 'earlier_visit',
  },
  a4: {
    id: 'a4',
    priority: 'optional',
    statusChip: 'Новый · желательная реакция',
    title: 'Пропуски дневника — Белова Ольга, 29',
    meta: 'Тип: adherence · Источник: дневник · Правило: ≥5 дней без записей',
    dataRows: [
      {
        id: 'd1',
        label: 'Пропуски дневника',
        value: '5 дней',
        valueTone: 'warning',
      },
      {
        id: 'd2',
        label: 'Последняя запись',
        value: '2 дня назад',
      },
    ],
    timeline: [
      {
        id: 't1',
        time: '2 дня',
        text: 'Создан алерт (adherence)',
        tone: 'done',
      },
      {
        id: 't2',
        text: 'Ждёт: врач принимает алерт в работу',
        tone: 'pending',
      },
    ],
    routing: [
      {
        id: 'observe',
        title: 'Наблюдение · усилить мониторинг',
      },
      {
        id: 'earlier_visit',
        title: 'Очная консультация раньше срока',
      },
      {
        id: 'emergency',
        title: 'Экстренная помощь / госпитализация',
      },
    ],
    commentDefault: '',
    riskDefault: 'low',
    routingDefault: 'observe',
  },
}

export const adverseEventAlert: AdverseEventAlert = {
  id: 'a2',
  patientId: 'p1',
  patientFullName: 'Миронова Анна',
  patientAge: 34,
  crumbKind: 'Нежелательное явление',
  chips: [
    { id: 'c1', label: 'Обязательно', tone: 'danger' },
    { id: 'c2', label: 'Рецептурный контур', tone: 'violet' },
    { id: 'c3', label: 'Новое · 18 окт, 10:12', tone: 'muted' },
  ],
  title: 'Возможная аллергическая реакция — Миронова Анна, 34',
  subtitle:
    'Пациент отметил в приложении: сыпь, зуд · умеренно · со вчера · фото приложено',
  report: {
    sourceLabel: 'из приложения · 18 окт, 10:12',
    symptoms: [
      { id: 's1', label: 'Сыпь', tone: 'rash' },
      { id: 's2', label: 'Зуд', tone: 'itch' },
      { id: 's3', label: 'Сонливость', tone: 'drowsy' },
    ],
    fields: [
      { id: 'f1', label: 'Выраженность', value: 'умеренно' },
      { id: 'f2', label: 'Начало', value: 'вчера, 17 окт' },
      {
        id: 'f3',
        label: 'Комментарий',
        value: '«Со вчера сыпь на руках, чешется»',
        italic: true,
      },
    ],
  },
  evidence: [
    {
      id: 'e1',
      tag: 'ОХЛП Авиандр, 4.3',
      text: 'Гиперчувствительность к компонентам — противопоказание.',
    },
    {
      id: 'e2',
      tag: 'ОХЛП Авиандр, 4.8',
      text: 'Кожные реакции — нечастые НЯ; требуется оценка врача.',
    },
    {
      id: 'e3',
      tag: 'Дневник',
      text: 'Старт приёма 11 окт · симптомы на 8-й день.',
    },
    {
      id: 'e4',
      tag: 'Анамнез',
      text: 'Аллергия на лекарства: «нет» (опрос 4 окт).',
    },
  ],
  suggestion:
    'Приостановить приём Авиандра до осмотра. Окончательное решение — за вами.',
  therapyOptions: [
    {
      id: 'suspend',
      title: 'Приостановить приём до осмотра',
      subtitle: 'пациент получит уведомление в приложении',
    },
    {
      id: 'continue',
      title: 'Продолжить, наблюдать',
    },
    {
      id: 'replace',
      title: 'Отменить препарат и подобрать замену',
    },
  ],
  therapyDefault: 'suspend',
  registerDefault: true,
}
