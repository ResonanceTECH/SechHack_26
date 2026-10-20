export const inviteDoctorMeta = {
  title: 'Пригласить врача',
  subtitle:
    'Сотрудник получит доступ только после активации аккаунта и проверки квалификации.',
  backLabel: 'К сотрудникам',
  emailLabel: 'Рабочий e-mail',
  emailDefault: 'e.sokolova@ravnovesie.ru',
  roleLabel: 'Роль сотрудника',
  departmentLabel: 'Подразделение',
  rightsTitle: 'Права после проверки',
  rightsBody:
    'Общий контур: закреплённые пациенты. Рецептурный контур включается отдельно после проверки полномочий.',
  footerNote:
    'Приглашение действует 72 часа. Роль и клиника закреплены за адресом получателя.',
  submitLabel: 'Отправить приглашение',
  cancelLabel: 'Отмена',
}

export const inviteDoctorRoles = [
  { id: 'psychiatrist', label: 'Врач-психиатр' },
  { id: 'psychologist', label: 'Психолог' },
  { id: 'nurse', label: 'Медсестра' },
  { id: 'coordinator', label: 'Координатор' },
] as const

export const inviteDoctorDepartments = [
  { id: 'outpatient', label: 'Амбулаторная психиатрия' },
  { id: 'day_hospital', label: 'Дневной стационар' },
  { id: 'inpatient', label: 'Стационар' },
] as const

export const inviteDoctorTips = [
  {
    id: 'no-self',
    title: 'Без самостоятельного выбора прав',
    body: 'Сотрудник не сможет сам сменить роль или клинику — всё задаётся этим приглашением.',
  },
  {
    id: 'need-admin',
    title: 'Нужен администратор?',
    body: 'Если не нужны врачебные права, переключитесь на приглашение администратора.',
  },
  {
    id: 'other-roles',
    title: 'Другие роли',
    body: 'Психолог — только общий контур. Координатор — расписание и контакты, без рецептурного доступа.',
  },
] as const
