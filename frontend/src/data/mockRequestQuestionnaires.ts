export interface RequestQuestionnaireOption {
  id: string
  code: string
  title: string
  questionsLabel: string
  defaultChecked: boolean
  /** Показывать инфо-блок про риск (PHQ-9 п.9) */
  riskNote?: boolean
}

export interface RequestQuestionnaireMeta {
  lastCompletedLabel: string
  dueLabel: string
  infoText: string
  footerText: string
}

/** Каталог опросников — референс «Запросить опросники» */
export const requestQuestionnaireOptions: RequestQuestionnaireOption[] = [
  {
    id: 'phq9',
    code: 'PHQ-9',
    title: 'настроение',
    questionsLabel: '9 вопросов',
    defaultChecked: true,
    riskNote: true,
  },
  {
    id: 'gad7',
    code: 'GAD-7',
    title: 'тревога',
    questionsLabel: '7 вопросов',
    defaultChecked: true,
  },
  {
    id: 'hypomania',
    code: 'Скрининг гипомании',
    title: '',
    questionsLabel: '8 вопросов',
    defaultChecked: false,
  },
]

export const requestQuestionnaireMeta: RequestQuestionnaireMeta = {
  lastCompletedLabel: 'последний опросник — 4 октября',
  dueLabel: '20 октября',
  infoText:
    'Если в п. 9 PHQ-9 ответ отличается от «Ни разу», уточняющие вопросы о риске добавятся автоматически.',
  footerText:
    'Пациент получит уведомление «Повторный опросник». Результаты появятся в карточке пациента.',
}
