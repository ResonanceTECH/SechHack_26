export const requestClarificationMeta = {
  title: 'Запросить уточнение профиля',
  noteLabel: 'Что нужно уточнить',
  noteDefault:
    'Загрузите читаемую копию аккредитации и проверьте срок действия.',
  noticeTitle: 'Рабочий доступ остаётся закрыт',
  noticeBody:
    'Сотрудник получит письмо с замечанием. После исправления профиль снова поступит на проверку.',
  submitLabel: 'Отправить запрос',
  cancelLabel: 'Отмена',
}

export const requestClarificationEmployee = {
  fullName: 'Соколова Елена Сергеевна',
  roleLabel: 'врач-психиатр',
}

export const requestClarificationTips = [
  {
    id: 'no-self-activate',
    title: 'Без самостоятельной активации',
    body: 'Редактирование профиля не активирует роль. Для выдачи прав нужно повторное решение администратора.',
  },
] as const
