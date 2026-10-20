export const rejectApplicationMeta = {
  title: 'Отклонить заявку сотрудника',
  statusLabel: 'Доступ останется закрыт',
  reasonLabel: 'Причина отказа · видна сотруднику',
  reasonDefault: 'Не удалось подтвердить действующую квалификацию.',
  noticeTitle: 'Отказ не удаляет аккаунт',
  noticeBody:
    'Врач получит причину решения и сможет подать исправленную заявку. Доступ к пациентам и контурам не выдаётся.',
  submitLabel: 'Отклонить заявку',
  cancelLabel: 'Вернуться к проверке',
}

export const rejectApplicationEmployee = {
  fullName: 'Соколова Елена Сергеевна',
  roleLine: 'заявка на роль врача-психиатра',
}

export const rejectApplicationTips = [
  {
    id: 'reason-required',
    title: 'Причина обязательна',
    body: 'Укажите, какие сведения не прошли проверку. Не включайте в комментарий медицинские данные третьих лиц.',
  },
] as const
