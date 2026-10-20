export const rolesAccessMeta = {
  title: 'Роли и границы доступа',
  subtitle:
    'Роль задаёт действия, клиника и закреплённые пациенты — зону доступа.',
  toEmployeesLabel: 'К сотрудникам',
  inviteDoctorLabel: 'Пригласить врача',
  addAdminLabel: 'Добавить административную роль',
}

export const rolesAccessRows = [
  {
    id: 'psychiatrist',
    role: 'Врач-психиатр',
    general: 'Закреплённые пациенты',
    prescription: 'После проверки полномочий',
    clinic: 'Нет',
  },
  {
    id: 'psychotherapist',
    role: 'Врач-психотерапевт',
    general: 'Закреплённые пациенты',
    prescription: 'После проверки полномочий',
    clinic: 'Нет',
  },
  {
    id: 'psychologist',
    role: 'Психолог',
    general: 'Дневники, опросники, упражнения',
    prescription: 'Нет',
    clinic: 'Нет',
  },
  {
    id: 'coordinator',
    role: 'Координатор',
    general: 'Контакты и расписание',
    prescription: 'Нет',
    clinic: 'Нет',
  },
  {
    id: 'admin',
    role: 'Администратор',
    general: 'Без клинических данных',
    prescription: 'Нет',
    clinic: 'Команда, роли, настройки, аудит',
  },
] as const

export const rolesAccessTips = [
  {
    id: 'combine',
    title: 'Роли можно совмещать после отдельного подтверждения',
    body: 'Администратор + врач получают два рабочих контекста. Клинические права не включаются автоматически.',
  },
  {
    id: 'scope',
    title: 'Назначение роли не равно доступу ко всем пациентам',
    body: 'Права действуют в выбранной клинике. Зоны доступа и закрепления пациентов назначаются отдельно.',
  },
] as const
