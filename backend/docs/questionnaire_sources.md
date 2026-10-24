# Источники вопросников и ограничения БД

Источник истины для кодов вопросников и их определений: backend/app/core/questionnaire_registry.py.

## Поддерживаемые коды

Реестр содержит 8 вопросников:

- hcl8
- pdss
- cssrs
- isi
- hcl33
- phq9
- gad7
- ymrs

## Ограничение CHECK screening_results (chk_screening_score_range)

Максимальные значения score по типу вопросника:

- phq9 (score <= 27)
- gad7 (score <= 21)
- ymrs (score <= 60)
- hcl8 (score <= 8)
- pdss (score <= 28)
- cssrs (score <= 6)
- isi (score <= 28)
- hcl33 (score <= 33)

Расширение CHECK-ограничения выполнено миграцией 0015_screening_registry.

## Источники и примечания

- PHQ-9: валидизированный инструмент оценки депрессии; критическое правило: пункт 9 >= 1 или сумма >= 20. Источники: Kroenke et al., 2001; российские публикации по адаптации PHQ-9.
- GAD-7: инструмент оценки генерализованного тревожного расстройства; критический порог суммы >= 15. Источник: Spitzer et al., 2006.
- HCL-8 / HCL-33: сокращённые/полные версии Hypomania Checklist; критические пороги суммы: HCL-8 >= 6, HCL-33 >= 14. Источники: Feng Y, Angst J, et al. The 33-item Hypomania Checklist (HCL-33): A new self-completed screening instrument for bipolar disorder // Journal of Affective Disorders, 2016, 190; российская адаптация: Сорокина М. Ю., Пантелеева Г. П., Абрамова Л. И., Костюк Г. П. Разработка и апробация в России нового опросника HCL-33 // Социальная и клиническая психиатрия, 2021, №6; HCL-8: Сорокина М. Ю. и др. (2015).
- C-SSRS: Columbia-Suicide Severity Rating Scale; критическое правило: любой положительный ответ. Источник: Posner K, et al. The Columbia-Suicide Severity Rating Scale: initial validity and internal consistency findings from three multisite studies with adolescents and adults // American Journal of Psychiatry, 2011.
- PDSS: Panic Disorder Severity Scale; критический порог суммы >= 15. Источник: Shear MK, et al. Multicenter collaborative panic disorder severity scale // American Journal of Psychiatry, 1997.
- YMRS: Young Mania Rating Scale; 11 пунктов, максимум 60; критический порог суммы >= 20. Источник: Young RC, et al. A rating scale for mania: reliability, validity and sensitivity // British Journal of Psychiatry, 1978.
- ISI: Insomnia Severity Index; критический порог суммы >= 15. Источник: Bastien CH, Vallieres A, Morin CM. Validation of the Insomnia Severity Index as an outcome measure for insomnia research // Sleep Medicine, 2001.
