import type { GrlsMedication } from '@/types/doctor'

export const medications: GrlsMedication[] = [
  {
    id: 'aviandr',
    tradeName: 'АВИАНДР®',
    shortName: 'Авиандр',
    innLine:
      'маритупирдин · таблетки, покрытые плёночной оболочкой, 20 мг',
    category: 'анксиолитическое средство',
    badges: [
      { id: 'rx', label: 'Рецептурный', tone: 'rx' },
      {
        id: 'monitor',
        label: 'Дополнительный мониторинг',
        tone: 'monitor',
      },
      {
        id: 'grls',
        label: 'ГРЛС · обновлено 12.09.2026',
        tone: 'grls',
      },
    ],
    grlsUrl: 'https://grls.rosminzdrav.ru/',
    indications: [
      'Генерализованное тревожное расстройство',
      'Тревожные состояния после COVID-19 у пациентов со стрессовой реакцией и нарушением адаптации лёгкой и средней степени',
    ],
    indicationsFooter: 'Взрослые старше 18 лет',
    contraindications: [
      'Гиперчувствительность к компонентам',
      'Эпилепсия и органические заболевания головного мозга',
      'Приём с ингибиторами МАО и 2 недели после их отмены',
      'Почечная недостаточность средней и тяжёлой степени (СКФ < 60 мл/мин)',
      'Печёночная недостаточность (Чайлд-Пью А, В, С)',
    ],
    dosage: [
      { id: 'dose', label: 'Доза', value: '20 мг 2 раза в сутки' },
      {
        id: 'intake',
        label: 'Приём',
        value: 'внутрь, за 30 мин до еды',
      },
      { id: 'gad', label: 'ГТР', value: 'длительность — врач' },
      {
        id: 'anxiety',
        label: 'Тревожные состояния',
        value: '4 нед., до 6 нед.',
      },
      { id: 'stop', label: 'Отмена', value: 'без снижения дозы' },
      { id: 'miss', label: 'Пропуск дозы', value: 'не восполнять' },
    ],
    adverse: [
      {
        id: 'often',
        label: 'Часто',
        value: 'головокружение, сонливость, астения',
        valueTone: 'warn',
      },
      {
        id: 'rare',
        label: 'Нечасто',
        value:
          'снижение аппетита, усиление тревоги, инсомния в начале приёма',
        valueTone: 'ink',
      },
    ],
    adverseNote:
      'Обычно лёгкие и преходящие, в первые дни приёма; как правило не требуют отмены терапии.',
    interactions: [
      {
        id: 'mao',
        severity: 'mandatory',
        severityLabel: 'Обязательно',
        body: 'Ингибиторы МАО (моклобемид, фенелзин и др.) — не применять совместно',
        footer: 'Противопоказано',
      },
      {
        id: 'sedative',
        severity: 'preferred',
        severityLabel: 'Желательно',
        body: 'Седативные: бензодиазепины, нейролептики, барбитураты, H1-блокаторы — усиление седации',
        footer: 'Осторожность',
      },
      {
        id: 'serotonin',
        severity: 'preferred',
        severityLabel: 'Желательно',
        body: 'Серотонинергические: СИОЗС, ТЦА, трамадол, триптаны, литий, зверобой',
        footer: 'Риск серотонинового синдрома',
      },
      {
        id: 'cyp',
        severity: 'preferred',
        severityLabel: 'Желательно',
        body: 'Ингибиторы CYP2D6 и алкоголь',
        footer: 'Осторожность',
      },
    ],
  },
]

export function findMedications(query: string): GrlsMedication[] {
  const q = query.trim().toLowerCase()
  if (!q) return medications
  return medications.filter(
    (m) =>
      m.tradeName.toLowerCase().includes(q) ||
      m.shortName.toLowerCase().includes(q) ||
      m.innLine.toLowerCase().includes(q),
  )
}
