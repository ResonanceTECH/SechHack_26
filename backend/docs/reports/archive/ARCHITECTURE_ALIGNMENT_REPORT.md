# ARCHITECTURE_ALIGNMENT_REPORT

Дата: 2026-10-23  
Область: синхронизация архитектуры с клиническими требованиями и экранами врача/пациента.  
Тип изменения: только архитектурная синхронизация, код/миграции/API не изменялись.

## Executive Summary

Текущая архитектура в целом корректна и не требует переписывания. Основные изменения касаются слоя диагнозов, Measurement Based Care, дневника, Safety Plan и состава Physician Patient Card. Слой диагнозов фактически реализован до Phase 14 и теперь включает dual ICD-10/ICD-11, `DiagnosisReference`, deprecated alias `/api/v1/icd10`, clinic isolation и audit logging. MBC, diary rework, SafetyPlanTemplate/ClinicalContentLibrary и расширенные блоки Patient Card остаются архитектурно запланированными, но не реализованными.

`docs/openapi.json` устарел: не содержит диагнозы, `DiagnosisReference`, alias и clinic isolation. Требуется регенерация OpenAPI в следующей implementation phase.

## Источники истины

1. Код backend.
2. Миграции Alembic.
3. `CURRENT_API.md`.
4. `API_CONTRACTS.md`.
5. `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `DB_SCHEMA.md`, `MODULES.md`, `TASKS.md`.
6. `docs/figma/CLINICAL_ARCHITECTURE_REVIEW.md`.
7. Клинические требования из review.

## 1. Diagnosis Layer

### Уже покрыто архитектурой

- `PatientDiagnosis` реализован: `coding_system` (`ICD10`/`ICD11`), `code`, `title`, `is_primary`, `status` (`active`/`remission`/`resolved`/`closed`), `diagnosed_at`, `ended_at`, `diagnosed_by`, `is_confirmed`, `notes`.
- Коморбидность поддерживается: множество активных диагнозов на пациента.
- История диагнозов поддерживается через `status`, `diagnosed_at`, `ended_at`.
- Primary diagnosis поддерживается partial unique index: один активный первичный диагноз на пациента.
- Dual ICD-10/ICD-11 реализован через `coding_system`.
- `DiagnosisReference` реализован: таблица `diagnosis_references`, миграция 0007, seed subset ICD-10/ICD-11.
- API: `/api/v1/diagnoses`, `/api/v1/patients/{id}/diagnoses`, deprecated alias `/api/v1/icd10`.
- Clinic isolation реализована в service layer для create/update/list.
- Audit logging реализован на create/update.
- RBAC: `diagnosis:read` / `diagnosis:write`.
- Patient Card summary включает диагнозы.

### Требует изменения доменной модели

- Нет новых обязательных полей в `PatientDiagnosis`; текущая модель достаточна.
- `DiagnosisReference` может потребовать расширение справочника (полный ICD-10/ICD-11, локализация, иерархия parent_code) в будущем, но базовая сущность уже есть.

### Требует изменения БД

- Нет новых миграций в рамках этой синхронизации.
- Полный импорт справочников ICD-10/ICD-11 может потребовать data migration/backfill в будущей фазе.

### Требует изменения API

- Нет новых endpoint в рамках этой синхронизации.
- Alias `/api/v1/icd10` уже реализован; документация `CURRENT_API.md` и `API_CONTRACTS.md` синхронизированы.

## 2. Measurement Based Care (MBC)

### Уже покрыто архитектурой

- Screening service поддерживает PHQ-9 и GAD-7.
- Questionnaire registry/versioning/severity/critical rules уже реализованы.
- Screening result history доступна.
- Архитектура готова к добавлению PDSS, HCL-33, C-SSRS через registry.

### Требует изменения доменной модели

- Добавить `AssessmentPlan`: `patient_id`, `questionnaire_code`, `interval_days`, `enabled`, `start_date`, `end_date`.
- Опционально добавить `SymptomTrend` для трендов результатов.
- Связь Diagnosis → Assessment Plan → Screening → Trend должна быть явной в доменной модели.

### Требует изменения БД

- Новая таблица `assessment_plans`.
- Опционально новая таблица `symptom_trends` или view/materialized aggregation.

### Требует изменения API

- CRUD/assignment endpoints для AssessmentPlan.
- Patient Card summary должен включать assessment schedule и screening trends.

## 3. Diary Service

### Уже покрыто архитектурой

- Diary service существует как модуль, но текущая модель: `mood 1..5`, `anxiety 1..5`, `energy 1..5`.
- Ограничения CHECK описаны в `DB_SCHEMA.md` и `DOMAIN_MODEL.md`.

### Требует изменения доменной модели

- Новая шкала: `mood -3..+3`, `anxiety 0..4`, `energy 0..4`, `functioning 0..4`.
- Добавить `functioning_score` (или `daily_functioning`).
- Поддержать micro-diary: частичные записи, nullable поля, быстрый ввод (1 tap / 5 sec).
- Полноценные заметки оставить дополнительной функцией.

### Требует изменения БД

- ALTER CHECK constraints для новых диапазонов.
- ADD COLUMN `functioning_score`.
- Решение по миграции старых данных (`1..5` → новые шкалы) требуется отдельно.

### Требует изменения API

- Обновить diary endpoints и validation под новые диапазоны.
- Поддержать partial payloads для micro-diary.

## 4. Safety Plan

### Уже покрыто архитектурой

- Safety Plan остаётся patient-specific сущностью.
- Базовая сущность `safety_plans` описана в архитектуре/DB.

### Требует изменения доменной модели

- Safety Plan остаётся сущностью, не становится просто контентным модулем.
- Reusable clinical content (AWARE, памятки при депрессии, кризисный алгоритм, контакты помощи, инструкции для родственников/врача) выносится в `SafetyPlanTemplate` / `ClinicalContentLibrary`.
- `SafetyPlan` ссылается на шаблон через nullable `template_id` + override.
- Добавить structured contacts (JSONB) и crisis steps.

### Требует изменения БД

- Новая таблица `safety_plan_templates` / `clinical_content_library`.
- Добавить `template_id` nullable FK в `safety_plans`.
- JSONB для contacts/crisis steps.

### Требует изменения API

- Endpoints для шаблонов и patient-specific safety plans.
- Patient Card summary должен включать safety plans и crisis history.

## 5. Physician Patient Card

### Уже поддерживается архитектурой

- Демография пациента.
- Скрининги и история.
- Дневник (текущая модель).
- Алерты.
- Медикаменты (базовая архитектура).
- Диагнозы (active + history + primary) после Phase 14.

### Отсутствует в архитектуре

- Assessment schedule (MBC).
- Adherence summary.
- Safety plans.
- Crisis history.
- Screening trends.
- Расширенный клинический контекст (коморбидность уже поддержана диагнозами, но агрегаты Patient Card нужно развивать).

### Требует изменения доменной модели

- Patient Card как агрегат должен включать диагнозы, assessment schedule, adherence, safety plans, crisis history, screening trends.

### Требует изменения БД

- Зависит от MBC, SafetyPlanTemplate, adherence tracking.

### Требует изменения API

- Расширить `GET /patients/{id}/summary` (или эквивалентный patient card endpoint) новыми блоками.

## Сводная таблица изменений

| Область | Already Covered | Requires Domain Change | Requires DB Change | Requires API Change |
|---|---|---|---|---|
| Diagnosis Layer | PatientDiagnosis, dual ICD, comorbidity, history, primary, DiagnosisReference, alias, clinic isolation, audit | Расширение справочника (опционально) | Полный импорт ICD (опционально) | Нет новых endpoint |
| MBC | Screening registry/versioning/severity/critical | AssessmentPlan, SymptomTrend, chain | assessment_plans, symptom_trends | AssessmentPlan CRUD/schedule |
| Diary | Diary module, текущие шкалы | Новые шкалы, functioning_score, micro-diary | ALTER CHECK, ADD COLUMN | Partial payloads, validation |
| Safety Plan | Patient-specific safety plan | SafetyPlanTemplate/ClinicalContentLibrary, template_id, contacts, crisis steps | safety_plan_templates, template_id, JSONB | Template + plan endpoints |
| Physician Patient Card | Демография, скрининги, дневник, алерты, медикаменты, диагнозы | Агрегат с новыми блоками | Зависит от MBC/Safety/Adherence | Расширить patient summary |

## Обновлённые документы

- `ARCHITECTURE.md`
- `DOMAIN_MODEL.md`
- `DB_SCHEMA.md`
- `API_CONTRACTS.md`
- `MODULES.md`
- `TASKS.md`
- `CURRENT_API.md`

## Риски

- `docs/openapi.json` устарел и не отражает Phase 14; нельзя использовать как источник истины для диагнозов до регенерации.
- Diary rework требует решения по миграции старых данных; без решения возможна потеря клинической интерпретации.
- Полный импорт ICD-10/ICD-11 может быть большим по объёму; seed subset достаточен для MVP.
- C-SSRS является клиническим safety instrument; может потребовать отдельной сущности, а не только registry entry.

## Next Step

После завершения архитектурной синхронизации следующий технический этап: реализация MBC Layer — `AssessmentPlan` (domain + migration + service + API + tests), с привязкой Diagnosis → Assessment Plan → Screening → Trend, включая clinic isolation и audit logging по аналогии с Diagnosis Layer.
