# PHASE 11.0 — CLINICAL DOMAIN REVIEW

Дата: 2026-10-23  
Тип: архитектурный обзор (без кода, миграций и эндпоинтов)  
Источники: код (SechHack_26/backend), DB_SCHEMA.md, DOMAIN_MODEL.md, API_CONTRACTS.md, CURRENT_API.md, ARCHITECTURE.md, MODULES.md, TASKS.md, clinicalcompass/docs/figma/CLINICAL_ARCHITECTURE_REVIEW.md

---

# Executive Summary

Текущая архитектура (auth, patient, screening, alert, medication, diary) в целом корректна и не требует переписывания. Главное архитектурное упущение — **отсутствие слоя диагноза (Diagnosis)**: сейчас диагноз представлен одиночной записью `Icd10Code` без статуса/жизненного цикла/истории, без поддержки ICD-11, без связи с MBC. Второй пробел — **отсутствие Assessment Plan / MBC-слоя** (сейчас Screening → Result, без расписания и трендов). Третий — **модель дневника** (1..5 вместо -3..+3 / 0..4 и без `functioning_score`). Четвёртый — **SafetyPlan слишком узкий**, нужна выделенная библиотека шаблонов.

Классификация:
- A (сейчас): PatientDiagnosis-слой, ICD-10/ICD-11 стратегия, Patient Card diagnosis view.
- B (до Diary Service): DiaryEntry модель, functioning_score, микро-дневник.
- C (до Medication Service): Adverse Event Tracking (уже частично в alert type `adverse_event`).
- D (nice-to-have): SymptomTrend, ClinicalContentLibrary расширение, ICD-11 полный справочник.

---

# Existing Diagnosis Architecture

## Что реально есть в коде и документах

- **Код (SQLAlchemy):** нет модели диагноза. `app/models/__init__.py` не импортирует `Icd10Code`. Нет сервиса/репозитория/эндпоинта для диагнозов. `/api/v1/icd10` в CURRENT_API отмечен «ПЛАНИРУЕТСЯ».
- **DOMAIN_MODEL.md §1.23 `Icd10Code`:** поля `id, patient_id, practitioner_id, code, description, diagnosis_date, is_primary, is_confirmed, notes, created_at`. Нет: `coding_system`, `status`, `ended_at`, `updated_at`, связь с `DiagnosisReference`.
- **DB_SCHEMA.md `icd10_codes`:** нет `coding_system`, `status`, `ended_at`, `updated_at`. `is_primary` есть, `is_confirmed` есть. Индексы: patient_id, code, is_primary.
- **API_CONTRACTS.md:** `/api/v1/icd10` GET/POST/PUT (target). CURRENT_API: GET list, POST create, PUT update — статус «ПЛАНИРУЕТСЯ».

## Вывод

Текущая модель — **плоская запись МКБ-10 на пациента**, без жизненного цикла, без истории, без коморбидности-семантики (коморбидность возможна только как несколько строк, но без статусов/первичности-управления), без ICD-11.

---

# Diagnosis Layer Review

## Требования (из клинического обзора)

- PatientDiagnosis: `id, patient_id, coding_system, code, title, is_primary, status, diagnosed_at, ended_at, diagnosed_by, notes, created_at, updated_at`.
- `coding_system`: ICD10 / ICD11.
- Коморбидность: несколько активных диагнозов на пациента.
- История: resolved/closed диагнозы с датами.
- Primary diagnosis: один primary на пациента (или none).

## Соответствие текущей модели

| Требование | Текущий Icd10Code | Гап |
|---|---|---|
| diagnosis history | нет `ended_at`, нет `status` | нет жизненного цикла |
| diagnosis closure / remission | нет | нужно `status` enum + `ended_at` |
| primary diagnosis | `is_primary` есть | ок, но без constraint «один primary» |
| comorbidity | несколько строк возможно | ок на уровне строк, но нет статусов |
| ICD10 | `code` + `description` | ок |
| ICD11 | нет `coding_system` | нужен `coding_system` + справочник |

## Gaps (список)

1. Нет сущности `PatientDiagnosis` с `coding_system`, `status`, `ended_at`, `updated_at`.
2. Нет справочника кодов `DiagnosisReference` (ICD-10/ICD-11) — сейчас код вводится свободно.
3. Нет ограничения «один primary диагноз на пациента» (partial unique index).
4. Нет статуса диагноза (`active`, `resolved`, `remission`, `closed`).
5. `is_confirmed` есть, но семантика не описана (подтверждён ли диагноз).
6. Нет связи диагноза с MBC (AssessmentPlan) и с медикаментами.
7. Нет API для закрытия/ремиссии/изменения primary.
8. Нет audit-следа изменений диагноза (кроме общего audit_logs).

---

# Patient Card Review

## Что врач ожидает (из клинического обзора)

Карточка пациента должна показывать:
- Основной диагноз: код, система классификации, название, врач, дата постановки, статус.
- Сопутствующие диагнозы.
- Историю диагнозов.

## Что текущая модель не может представить

- Активные диагнозы с фильтрацией по `status=active`.
- Историю (закрытые/в ремиссии) с датами.
- Метаданные диагноза: `coding_system`, `title` (локализованное название), `diagnosed_by` (врач), `is_confirmed`.
- Ownership: `practitioner_id` есть, но нет «кто может менять» (RBAC) и нет `updated_by`.

## Вывод

Требуется отдельный слой `PatientDiagnosis` + endpoint-ы для карточки: `GET patient/{id}/diagnoses?status=...`, `POST`, `PATCH /{id}` (status/primary/notes), `PATCH /{id}/close`.

---

# MBC Review

## Требования

Цепочка: `Diagnosis → Assessment Plan → Screening → Trends`.

AssessmentPlan: `patient_id, questionnaire_code, interval_days, enabled, start_date, end_date`.

## Текущая архитектура скрининга

- ScreeningResult: PHQ-9/GAD-7, score, answers, is_critical, severity, critical_reason, created_at.
- Questionnaire Registry: версии, активные опросники.
- Нет сущности `AssessmentPlan`.
- Нет `SymptomTrend` (опционально).

## Поддерживает ли текущая архитектура MBC?

Частично:
- Шкалы и результаты есть.
- Версионирование есть.
- Критичность есть.
- Расписание (когда/кому/какую шкалу) — **отсутствует**.
- Тренды — **отсутствуют** (можно вычислять по ScreeningResult history, но нет явной сущности/агрегата).

## Missing entities

1. `AssessmentPlan` (MBC-слой).
2. `SymptomTrend` (optional, агрегат по screening/diary).
3. Связь `AssessmentPlan.questionnaire_code` → Questionnaire Registry.
4. Связь `AssessmentPlan` → PatientDiagnosis (опционально, для назначения шкалы по диагнозу).

## Вывод

MBC — отдельный слой поверх Screening, не часть Screening Service. Screening отвечает за шкалы/score; AssessmentPlan — за расписание.

---

# Diary Review

## Текущая модель (DiaryEntry)

- mood_score 1..5
- anxiety_score 1..5
- energy_score 1..5
- sleep_hours (float)
- sleep_quality (int, в коде есть, в DOMAIN_MODEL нет — расхождение)
- notes
- recorded_at, synced_at, device_id

## Предложенная модель (клиническая)

- mood -3..+3
- anxiety 0..4
- energy 0..4
- functioning 0..4 (новое поле)
- микро-дневник (1 тап, 5 сек, текст опционален)

## Impact

### Data model
- Изменить CHECK constraints: mood -3..+3, anxiety 0..4, energy 0..4, functioning 0..4.
- Добавить `functioning_score` (или `daily_functioning`).
- mood становится nullable? Для микро-дневника возможно частичное заполнение — решить на уровне схемы (nullable поля).
- `sleep_quality` уже в коде — синхронизировать с DOMAIN_MODEL/DB_SCHEMA.

### Migration
- Новая миграция: ALTER CHECK constraints, ADD COLUMN functioning_score.
- Данные: старые 1..5 → маппинг? Либо миграция данных, либо breaking change. Рекомендация: маппинг mood (1..5 → -2..+2) либо оставить историю как есть и новую шкалу с новой колонкой. Решение — до реализации.

### API
- Обновить схемы DiaryEntry create/read.
- Обновить валидацию.
- Обновить клиентские модели (mobile/web).

### Классификация
- B (Required before Diary Service).

---

# Safety Plan Review

## Текущая модель SafetyPlan

Поля: title, warning_signs, internal_coping_strategies, social_contacts, family_support, professional_contacts, emergency_contacts, safe_environment, is_active, review_date.

## Клинические требования

Поддерживать:
- AWARE
- памятки при депрессии
- кризисный алгоритм
- контакты помощи
- инструкции для родственников
- инструкции для врача

## Что должно остаться полями

Базовые поля SafetyPlan (patient-specific):
- warning_signs, internal_coping_strategies, social_contacts, family_support, professional_contacts, emergency_contacts, safe_environment, is_active, review_date, practitioner_id.

## Что должно стать шаблонами (SafetyPlanTemplate / ClinicalContentLibrary)

- AWARE (структурированный контент).
- Памятки при депрессии.
- Кризисный алгоритм.
- Инструкции для родственников.
- Инструкции для врача.

Это **reusable clinical content**, не patient-specific. Должны храниться в отдельной сущности `SafetyPlanTemplate` (или `ClinicalContentLibrary`) и ссылаться из SafetyPlan через `template_id` (nullable) + allow override.

## Что должно стать структурированным контентом

- Контакты помощи: структурированный список (name, phone, type) вместо TEXT.
- Кризисный алгоритм: steps array.

## Вывод

Расширить SafetyPlan: `template_id` FK, структурированные контакты (JSONB), steps. Создать `SafetyPlanTemplate`. Не переписывать основу.

---

# ICD10/ICD11 Strategy

## Цель

Future-proof diagnosis architecture: ICD-10 + ICD-11, API exposes coding system, совместимость с существующими ICD-10 workflows.

## Предлагаемая архитектура

### Сущности

1. `PatientDiagnosis` (переименование/эволюция `Icd10Code`):
   - id, patient_id, coding_system (enum ICD10/ICD11), code, title, is_primary, status (active/resolved/remission/closed), diagnosed_at, ended_at, diagnosed_by (practitioner_id), is_confirmed, notes, created_at, updated_at.

2. `DiagnosisReference` (справочник кодов):
   - id, coding_system, code, title (ru), title_en (optional), chapter, parent_code, is_active, version.
   - Источник истины для валидации кодов и автодополнения.

### API стратегия

- Endpoint: `/api/v1/diagnoses` (или `/api/v1/patients/{id}/diagnoses`) с фильтром `coding_system`, `status`.
- В ответе всегда возвращать `coding_system` + `code` + `title`.
- Обратная совместимость: `/api/v1/icd10` может остаться как фильтр `coding_system=ICD10` (deprecated alias) или быть заменён. Рекомендация: ввести `/api/v1/diagnoses` и держать `/api/v1/icd10` как alias с пометкой deprecated в течение переходного периода.

### Constraints

- Partial unique index: один primary diagnosis per patient (`WHERE is_primary = TRUE`).
- Partial unique index: один active primary? Решение: разрешить несколько active, но один primary.

### Миграция

- Переименовать `icd10_codes` → `patient_diagnoses` (или создать новую таблицу и мигрировать данные: coding_system='ICD10').
- Добавить `diagnosis_references` таблицу + seed ICD-10 (и позже ICD-11).

---

# Required Architecture Changes

## A. Required immediately
- Ввести `PatientDiagnosis` (эволюция `Icd10Code`) с `coding_system`, `status`, `ended_at`, `updated_at`.
- Ввести `DiagnosisReference` справочник.
- Patient Card: diagnosis view (active + history + primary).
- Partial unique index для primary diagnosis.
- API: `/api/v1/diagnoses` (+ deprecated alias `/api/v1/icd10`).

## B. Required before Diary Service
- DiaryEntry: mood -3..+3, anxiety 0..4, energy 0..4, functioning 0..4.
- Добавить `functioning_score`.
- Микро-дневник (nullable поля, partial entries).
- Синхронизировать `sleep_quality` в docs.
- Миграция CHECK constraints + data mapping decision.

## C. Required before Medication Service
- Adverse Event Tracking (already alert type `adverse_event`).
- Связь `MedicationSkipReason` с алертами (уже есть таблица).
- Диагноз → медикаменты (опционально).

## D. Nice-to-have
- AssessmentPlan / MBC layer (может быть отдельной фазой).
- SymptomTrend.
- SafetyPlanTemplate / ClinicalContentLibrary.
- C-SSRS в MVP (отложить, но учитывать экраны).
- Полный ICD-11 справочник.

---

# Changes Not Required

- RBAC/Auth — не менять.
- Screening Registry — не менять.
- Alert Foundation — не менять.
- Medication Architecture — не менять.
- Diary Service архитектура (offline sync, device_id) — не менять, только модель данных.
- Patient/Practitioner/Clinic модели — не менять.

---

# Recommended Implementation Order

1. Phase 10.1: Alert Hardening (уже).
2. Phase 10.2: Diagnosis Layer (ICD-10 + ICD-11) — PatientDiagnosis + DiagnosisReference + API + Patient Card.
3. Phase 10.3: Assessment Plan / MBC Layer.
4. Phase 11: Diary Service (с новой моделью).
5. Phase 12: PDSS Integration (через Registry).
6. Phase 13: Medication Service (Adverse Events).
7. Phase 14: Notification Service.
8. Phase 15: Program Service.

---

# Risks

- Breaking change шкалы дневника: маппинг старых данных 1..5 → новая шкала требует решения (миграция данных vs breaking).
- ICD-11 справочник объёмный — нужен seed-процесс и версионирование.
- AssessmentPlan расписание может пересекаться с существующими screening flows — нужна чёткая граница.
- SafetyPlanTemplate vs ClinicalContentLibrary — выбрать один термин до реализации.
- Частичные записи дневника (микро-дневник) усложняют валидацию и агрегацию трендов.
- Ограничение «один primary diagnosis» требует transactional logic при смене primary.
