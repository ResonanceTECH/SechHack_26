import type { PatientMedicationsTab } from '@/types/doctor'

/** Референс · вкладка «Препараты» (Миронова) */
export const mironovaMedications: PatientMedicationsTab = {
  drug: {
    title: 'Авиандр® 20 мг',
    contourBadge: 'Рецептурный контур',
    schedule: '1 таблетка 2 раза в сутки · по текущему плану врача',
    courseLine: 'Начало: 11 октября · курс 4 недели · до 8 ноября',
    planLine: 'План лечения: версия 3 от 11 октября',
    adherenceLabel: 'Отмечено пациентом',
    adherencePercent: '92%',
    adherenceDoses: '26 из 28 доз',
    adherenceNote:
      'Отметки не подтверждают приём автоматически. Схему меняет врач в плане лечения.',
    grlsCta: 'Инструкция препарата · ГРЛС',
    grlsTo: '/medications',
  },
  alert: {
    statusLabel: 'Ожидает оценки врача',
    title: 'Сыпь и зуд · 18 октября',
    body: 'Сообщение с фото. Решение по терапии ещё не сохранено.',
    cta: 'Оценить нежелательное явление',
  },
  plan: {
    title: 'План лечения',
    body: 'Текущий курс: с 11 октября до 8 ноября. Продление курса показано в отдельном черновике и пока не сохранено.',
    cta: 'Открыть черновик плана',
  },
}

const byPatient: Record<string, PatientMedicationsTab> = {
  p1: mironovaMedications,
}

export function getPatientMedications(
  patientId: string,
): PatientMedicationsTab {
  return byPatient[patientId] ?? mironovaMedications
}
