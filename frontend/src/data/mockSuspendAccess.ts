export const suspendAccessMeta = {
  title: 'Приостановить доступ сотрудника',
  warningBadge: 'Важное изменение',
  warningTitle: 'Доступ закроется сразу',
  warningBody:
    'Рабочие сессии клиники завершатся. Новые действия с клиническими данными будут недоступны. История сохраняется.',
  patientsLabel: 'Передача активных пациентов',
  alertsLabel: 'Передать открытые алерты и задачи',
  reasonLabel: 'Причина приостановки',
  confirmLabel: 'Передача пациентов и задач подтверждена',
  submitLabel: 'Передать и приостановить',
  cancelLabel: 'Отмена',
}

export const suspendAccessEmployee = {
  fullName: 'Никитин Андрей Владимирович',
  roleLabel: 'психотерапевт',
  clinicName: 'клиника «Равновесие»',
}

export const suspendPatientOptions = [
  {
    id: 'smirnova-7',
    label: 'Смирнова Е. С. · врач-психиатр · 7 пациентов',
  },
] as const

export const suspendAlertOptions = [
  {
    id: 'smirnova-alerts',
    label: 'Смирнова Е. С. · 2 алерта и 3 задачи',
  },
] as const

export const suspendReasonOptions = [
  {
    id: 'left',
    label: 'Сотрудник завершил работу в клинике',
  },
  {
    id: 'temp',
    label: 'Временная приостановка по запросу клиники',
  },
  {
    id: 'review',
    label: 'Проверка полномочий и квалификации',
  },
] as const

export const suspendAccessTips = [
  {
    id: 'care',
    title: 'Наблюдение не прерывается',
    body: 'При наличии пациентов и открытых алертов сначала назначьте активного врача с подходящей ролью и правами.',
  },
  {
    id: 'last-admin',
    title: 'Последний администратор защищён',
    body: 'Приостановка последнего активного администратора блокируется до назначения другого ответственного.',
  },
] as const
