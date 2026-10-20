export type ScenarioCard = {
  id: string
  title: string
  flow: string
  cta: string
}

export type ScenarioLink = {
  id: string
  label: string
  variant: 'soft' | 'outline'
}

export const scenariosMeta = {
  badge: 'ПРОТОТИП · старт и смена сценария',
  title: 'Регистрация, команда и роли',
  subtitle:
    'Выберите историю. Каждый запуск очищает состояние предыдущей демонстрации. Письма и переходы между участниками выделены отдельным демонстрационным экраном.',
}

export const scenarioCards: ScenarioCard[] = [
  {
    id: 'new-clinic',
    title: 'Новая клиника',
    flow: 'Заявка → внешняя проверка → первый администратор → приглашение команды.',
    cta: 'Подключить клинику',
  },
  {
    id: 'doctor-invite',
    title: 'Врач по приглашению',
    flow: 'Аккаунт → профессиональный профиль → проверка администратором → первый вход.',
    cta: 'Принять приглашение',
  },
  {
    id: 'specialist-open',
    title: 'Специалист без приглашения',
    flow: 'Аккаунт → e-mail → выбор клиники → заявка на роль.',
    cta: 'Зарегистрировать специалиста',
  },
  {
    id: 'admin-verify',
    title: 'Администратор: проверка профиля',
    flow: 'Активация, уточнение или отказ. Затем — письмо и вход специалиста.',
    cta: 'Проверить заявку',
  },
  {
    id: 'second-admin',
    title: 'Второй администратор',
    flow: 'Приглашение → аккаунт или вход → второй фактор → команда клиники.',
    cta: 'Принять административную роль',
  },
  {
    id: 'active-clinic',
    title: 'Действующая клиника',
    flow: 'Существующие сотрудники: дополнительная роль и приостановка с передачей пациентов.',
    cta: 'Открыть кабинет администратора',
  },
]

export const scenarioLinks: ScenarioLink[] = [
  {
    id: 'invalid-invite',
    label: 'Недействительное приглашение',
    variant: 'soft',
  },
  {
    id: 'doctor-cabinet',
    label: 'Кабинет врача с пациентами',
    variant: 'outline',
  },
  {
    id: 'doctor-profile',
    label: 'Личный кабинет врача',
    variant: 'soft',
  },
]
