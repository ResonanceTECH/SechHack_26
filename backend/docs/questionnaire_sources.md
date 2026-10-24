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

Приоритет источников: **основные (одобренные в РФ)** — клинические рекомендации Минздрава РФ / КонсультантПлюс и psytests.org с российской адаптацией. Оригинальные (зарубежные) публикации и российские валидизационные статьи указаны как дополнительные.

- PHQ-9:
  - Основные (одобрено в РФ): КонсультантПлюс «Шкала оценки здоровья пациента (PHQ-2, PHQ-9)» — https://www.consultant.ru/document/cons_doc_LAW_478292/6a409fbdc696254f138e2c0dfd63f6c4d9f8c7f1/ ; КонсультантПлюс «Опросник по состоянию здоровья-9 (PHQ-9)» — https://www.consultant.ru/document/cons_doc_LAW_521021/16b4928f8a4fb43db7d6bfbdd41c9eddd0561835/ ; клинические рекомендации «Депрессивный эпизод, рекуррентное депрессивное расстройство» — https://www.consultant.ru/document/cons_doc_LAW_484489/ ; psytests.org — https://psytests.org/depr/phq9.html
  - Дополнительные: Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: validity of a brief depression severity measure // Journal of General Internal Medicine, 2001; российская валидизация PHQ-2/9 — https://doi.org/10.15829/1728-8800-2014-3-18-24; Zolotareva A. A. et al., 2023 — https://doi.org/10.17759/cpse.2023120406

- GAD-7:
  - Основные (одобрено в РФ): КонсультантПлюс «Скрининговый опросник ГТР-7» — https://www.consultant.ru/document/cons_doc_LAW_486381/31e827533979e0857d0421ec27ffd008cb7ea03f/ ; клинические рекомендации «Генерализованное тревожное расстройство» — https://www.consultant.ru/document/cons_doc_LAW_486381/ ; psytests.org — https://psytests.org/anxiety/gad7.html
  - Дополнительные: Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7 // Archives of Internal Medicine, 2006; Zolotareva A. A. et al., 2023 — https://doi.org/10.17759/cpp.2023310402

- HCL-8 / HCL-33:
  - Основные (одобрено в РФ): КонсультантПлюс «HCL-33. Опросник для выявления гипомании» — https://www.consultant.ru/document/cons_doc_LAW_510703/05d589b61a79635ecba652d7f8d51fcc9ae5387d/ ; клинические рекомендации «Биполярное аффективное расстройство» — https://www.consultant.ru/document/cons_doc_LAW_510703/ ; psytests.org (адаптация С. Н. Мосолов и др., 2021) — https://psytests.org/diag/hcl33.html
  - Дополнительные: Feng Y, Angst J, et al. The 33-item Hypomania Checklist (HCL-33): A new self-completed screening instrument for bipolar disorder // Journal of Affective Disorders, 2016, 190; российская адаптация: Сорокина М. Ю., Пантелеева Г. П., Абрамова Л. И., Костюк Г. П. Разработка и апробация в России нового опросника HCL-33 // Социальная и клиническая психиатрия, 2021, №6 — https://doi.org/10.1016/j.jadr.2021.100086; HCL-8: Сорокина М. Ю. и др., 2015

- C-SSRS:
  - Основные (одобрено в РФ): КонсультантПлюс «Колумбийская Шкала Оценки Тяжести Суицида (C-SSRS)» — https://www.consultant.ru/document/cons_doc_LAW_510703/b33875259d3f4b41f2999a894d936d45ab822740/ ; приложение Г1 клинических рекомендаций «Биполярное аффективное расстройство» — https://base.garant.ru/412348658/4b16257c478539d02689e6381119d7b3/ ; клинические рекомендации «Депрессивный эпизод, рекуррентное депрессивное расстройство» (приложение Г4) — https://base.garant.ru/409578883/7cbea0c4512ce29f121ee28b85ff067b/
  - Дополнительные: Posner K, et al. The Columbia-Suicide Severity Rating Scale: initial validity and internal consistency findings from three multisite studies with adolescents and adults // American Journal of Psychiatry, 2011; официальный источник — Columbia Lighthouse Project: https://cssrs.columbia.edu/

- PDSS:
  - Основные (одобрено в РФ): КонсультантПлюс «Шкала оценки тяжести панического расстройства» — https://www.consultant.ru/document/cons_doc_LAW_486420/2973fd4f9eccfb7d03b6819ec01e1eb140c18d03/ ; клинические рекомендации «Паническое расстройство» — https://www.consultant.ru/document/cons_doc_LAW_486420/ ; psytests.org — https://psytests.org/diag/pdss.html
  - Дополнительные: Shear MK, et al. Multicenter collaborative panic disorder severity scale // American Journal of Psychiatry, 1997

- ISI:
  - Основные (одобрено в РФ): КонсультантПлюс «Индекс тяжести инсомнии» — https://www.consultant.ru/document/cons_doc_LAW_478292/c3cd450b8e459c339ed9acd5447b8f234f1c4150/ ; клинические рекомендации (раздел «Сон») — https://www.consultant.ru/document/cons_doc_LAW_478292/40a70d09bc7778d6a191f7e71ea7d3234b91fa40/ ; psytests.org — https://psytests.org/diag/isi.html
  - Дополнительные: Bastien CH, Vallieres A, Morin CM. Validation of the Insomnia Severity Index as an outcome measure for insomnia research // Sleep Medicine, 2001

- YMRS:
  - Основные (одобрено в РФ): КонсультантПлюс «Шкала Янга для оценки выраженности маниакальной симптоматики» — https://www.consultant.ru/document/cons_doc_LAW_510703/9c728e49f4471834946da20d17c5407f65abc29f/ ; клинические рекомендации «Биполярное аффективное расстройство» — https://www.consultant.ru/document/cons_doc_LAW_510703/ ; psytests.org — https://psytests.org/diag/ymrs.html
  - Дополнительные: Young RC, et al. A rating scale for mania: reliability, validity and sensitivity // British Journal of Psychiatry, 1978

## Формулировки ответов (answer_scale)

Бэкенд отдаёт для каждого вопросника `answer_scale: [{value, label}]`. `value` — канонический балл для скоринга, `label` — человекочитаемая формулировка для мобильного клиента. Клиент рендерит `label` и отправляет выбранный `value`.

Текущая политика формулировок:

- PHQ-9 и GAD-7 используют официальные частотные якоря PHQ/GAD-7: «Совсем нет», «Несколько дней», «Более половины дней», «Почти каждый день».
  Источники:
  - Pfizer PHQ/GAD-7 instruction manual: https://manuals.dshs.wa.gov/sites/default/files/ALTSA/stakeholders/documents/duals/toolkit/Pfizer%20Instruction%20Manual%20for%20the%20PHQ-9.pdf
  - Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: validity of a brief depression severity measure // Journal of General Internal Medicine, 2001.
  - Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7 // Archives of Internal Medicine, 2006.
  - Одобренные в РФ формулировки: КонсультантПлюс «Шкала оценки здоровья пациента (PHQ-2, PHQ-9)» — https://www.consultant.ru/document/cons_doc_LAW_478292/6a409fbdc696254f138e2c0dfd63f6c4d9f8c7f1/ ; КонсультантПлюс «Скрининговый опросник ГТР-7» — https://www.consultant.ru/document/cons_doc_LAW_486381/31e827533979e0857d0421ec27ffd008cb7ea03f/
- HCL-8, HCL-33 и C-SSRS используют бинарные якоря «Нет» / «Да» (ответ на наличие симптома/признака).
  Источники:
  - КонсультантПлюс «HCL-33. Опросник для выявления гипомании» — https://www.consultant.ru/document/cons_doc_LAW_510703/05d589b61a79635ecba652d7f8d51fcc9ae5387d/
  - КонсультантПлюс «Колумбийская Шкала Оценки Тяжести Суицида (C-SSRS)» — https://www.consultant.ru/document/cons_doc_LAW_510703/b33875259d3f4b41f2999a894d936d45ab822740/
  - psytests.org HCL-33 (адаптация С. Н. Мосолов и др., 2021) — https://psytests.org/diag/hcl33.html
- PDSS и ISI теперь имеют item-specific anchors в поле `Question.anchors`; YMRS остаётся clinician-rated и использует числовые метки (`"0"`…`"4"` / `"0"`…`"8"`), потому что их якоря зависят от конкретного пункта и смешивают частоту, выраженность, удовлетворённость и нарушение функционирования. Для таких шкал числовая шкала с серверной валидацией `value` принята как безопасный и воспроизводимый контракт; текстовые пояснения лучше показывать в UI по конкретному вопросу, а не в общем `answer_scale`.
  Источники:
  - КонсультантПлюс «Шкала оценки тяжести панического расстройства» — https://www.consultant.ru/document/cons_doc_LAW_486420/2973fd4f9eccfb7d03b6819ec01e1eb140c18d03/
  - КонсультантПлюс «Индекс тяжести инсомнии» — https://www.consultant.ru/document/cons_doc_LAW_478292/c3cd450b8e459c339ed9acd5447b8f234f1c4150/
  - КонсультантПлюс «Шкала Янга для оценки выраженности маниакальной симптоматики» — https://www.consultant.ru/document/cons_doc_LAW_510703/9c728e49f4471834946da20d17c5407f65abc29f/
  - Shear MK, et al. Multicenter collaborative panic disorder severity scale // American Journal of Psychiatry, 1997.
  - Bastien CH, Vallières A, Morin CM. Validation of the Insomnia Severity Index as an outcome measure for insomnia research // Sleep Medicine, 2001.
  - Young RC, et al. A rating scale for mania: reliability, validity and sensitivity // British Journal of Psychiatry, 1978.
  - psytests.org PDSS — https://psytests.org/diag/pdss.html
  - psytests.org ISI — https://psytests.org/diag/isi.html
  - psytests.org YMRS — https://psytests.org/diag/ymrs.html

PDSS и ISI уже имеют item-specific `anchors` в поле `Question.anchors`; YMRS при необходимости следует расширять отдельно как item-specific metadata (`max_value`/anchors), а не подменять общий `answer_scale`.
