export const clinicTeamMeta = {
  title: 'Команда клиники',
  subtitle:
    'Клиника «Равновесие» · активные сотрудники, приглашения и заявки',
  checkAppsLabel: 'Проверить заявки',
  inviteDoctorLabel: 'Пригласить врача',
  inviteAdminLabel: 'Пригласить администратора',
  sectionTitle: 'Ваша команда',
  noticeTitle: 'Доступ к пациентам не выдаётся при приглашении',
  noticeBody:
    'У приглашённого сотрудника нет клинического доступа. Для врача нужны проверка роли и отдельные назначения пациентов.',
}

export const clinicTeamRows = [
  {
    id: 'orlova',
    name: 'Орлова П. А.',
    email: 'p.orlova@ravnovesie.ru',
    role: 'Администратор · первый',
    status: 'Активна',
  },
] as const
