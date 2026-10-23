# Модули MVP — детализация ТЗ §8.2

**Источник:** `ТЗ_Клинический_Компас_v1.0.md` §8.2, `docs/product/backend/ARCHITECTURE.md` §3, экраны Figma  
**Все 8 модулей входят в MVP.** Ниже — границы, функционал, API и правила для каждого.

---

## Модуль 1. Аутентификация и профили (`auth-service`)

**Status:** Implemented

**Назначение:** регистрация, вход, JWT-сессии, профили пациентов/специалистов, согласия (152-ФЗ).

**Функционал MVP:**
- Регистрация пациента с обязательным согласием на обработку ПД и медданных
- Регистрация/приглашение сотрудника клиники (создаёт `clinic_admin`)
- Вход с access/refresh токенами, refresh rotation, отзыв сессий
- Профиль текущего пользователя (`/auth/me`)
- Смена пароля, выход из всех устройств

**Границы:** не хранит клинические данные; только учётные записи и профили.

**Ключевые API:** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password`

**События:** `user.registered`, `user.logged_in`, `user.role_changed`

---

## Модуль 2. Ведение пациентов (`patient-service`)

**Status:** Implemented (core CRUD/summary; admin/audit/report remain planned)

**Назначение:** карточка пациента, список пациентов клиники, назначение врача.

**Функционал MVP:**
- Список карточек пациентов с фильтрами (клиника, врач, риск-уровень, поиск по ФИО)
- Карточка пациента: демография, последние скрининги, динамика дневника, активные алерты, рецепты, программы
- Сводка «последние 7 / 30 дней» для оперативного просмотра на приёме
- Привязка пациента к практикующему специалисту

**Границы:** агрегирует данные других модулей через внутренние сервисы, собственных данных о диагнозах не хранит.

**Ключевые API:** `GET /patients`, `GET /patients/{id}`, `PATCH /patients/{id}`, `GET /patients/{id}/summary`

**Правила доступа:** пациент видит только свой профиль; врач — пациентов своей клиники.

---

## Модуль 3. Скрининговые опросники (`screening-service`)

**Status:** Implemented (PHQ-9/GAD-7, registry, scoring, severity, critical rules, endpoints, migrations 0002/0003/0004/0005)

**Назначение:** PHQ-9, GAD-7, подсчёт баллов, интерпретация, выявление риска.

**Функционал MVP:**
- Хранение версионированных шаблонов опросников (в конфигурации/коде — `phq9`, `gad7`)
- Приём ответов, серверный подсчёт балла (клиент не влияет на результат)
- Интерпретация: PHQ-9 0–4 — отсутствие или минимальный уровень депрессии; 5–9 — лёгкая депрессия, рекомендована консультация психолога; 10–14 — умеренная депрессия, рекомендована консультация психолога, психотерапевта; 15–19 — тяжёлая депрессия, необходима консультация психотерапевта, психиатра; 20–27 — крайне тяжёлая депрессия, необходима срочная консультация психиатра. GAD-7 0–4 — минимальная выраженность тревоги (или её отсутствие); 5–9 — лёгкая тревожность, рекомендуется наблюдать за состоянием и применять техники саморегуляции; 10–14 — умеренная тревожность, порог от 10 баллов считается «положительным» скринингом; 15–21 — высокая (тяжёлая) тревожность
- Флаг критического результата: PHQ-9 п.9 ≥ 1 (суицидальный риск) или суммарный балл ≥ 20
- История прохождений и график динамики

**Границы:** результат не является диагнозом; в ответе клиенту — маркировка «не является медицинским заключением».

**Ключевые API:** `GET /screenings`, `POST /screenings`, `GET /screenings/{id}`, `GET /patients/{id}/screenings`

**События:** `screening.completed` → триггер алерта `screening_risk` / `critical_symptom`

---

## Модуль 4. Дневник самооценки (`diary-service`)

**Status:** Planned

**Назначение:** микро-отметки настроения/тревоги/сна/энергии, графики, офлайн-синхронизация.

**Функционал MVP:**
- Ежедневная отметка (настроение, тревога, энергия, сон, заметка)
- Получение записей за период (для графика)
- Офлайн-синхронизация: мобильный клиент шлёт пакет записей с `device_id`, сервер дедуплицирует по `(device_id, recorded_at, patient_id)`
- Расчёт агрегатов за период (средние значения, тренд)

**Границы:** не хранит «сырые» произвольные данные — только фиксированный набор шкал.

**Ключевые API:** `GET /diary`, `POST /diary`, `PUT /diary/{id}`, `DELETE /diary/{id}`, `POST /diary/bulk-sync`, `GET /diary/summary`

**События:** `diary.entry.created` → проверка пропусков (алерт `missed_diary`)

---

## Модуль 5. Программы и упражнения (`program-service`)

**Status:** Planned

**Назначение:** индивидуальный план сопровождения, назначение упражнений, отслеживание приверженности.

**Функционал MVP:**
- Создание/редактирование программы сопровождения пациента (CarePlan) с периодом и описанием
- Назначение упражнений в рамках программы (ExerciseAssignment): поведенческая активация, дневник мыслей, экспозиционная терапия, релаксация, физическая активность
- Отметка выполнения пациентом, расчёт adherence
- Сводка приверженности для врача

**Границы:** содержание упражнений — клинический контент, в MVP задаётся врачом, библиотека шаблонов — заглушка.

**Ключевые API:** `GET /care-plans`, `POST /care-plans`, `GET /exercises`, `POST /exercises`, `PUT /exercises/{id}`, `POST /exercises/{id}/complete`, `GET /exercises/{id}/compliance`

**События:** `exercise.overdue` → алерт `adherence`

---

## Модуль 6. Система алертов и план безопасности (`alert-service`)

**Status:** Partial (alert foundation/constants present; full Alert Service not implemented)

**Назначение:** обнаружение рисков, приоритизация, очередь для врача, план безопасности при суицидальном риске.

**Функционал MVP:**
- Правила обнаружения:
  - PHQ-9 п.9 ≥ 1 → алерт `critical_symptom`, приоритет `mandatory`
  - Суммарный PHQ-9 ≥ 20 или GAD-7 ≥ 15 → `screening_risk`, приоритет `mandatory`
  - Пропуск дневника ≥ 3 дня → `missed_diary`, приоритет `optional`
  - Незавершённое упражнение с истёкшим сроком → `adherence`, приоритет `optional`
  - Отказ от приёма препарата ≥ 3 раз подряд → `adherence`, приоритет `rx`
  - Побочное действие, отмеченное пациентом → `adverse_event`, приоритет `rx`
- Жизненный цикл: `new` → `in_progress` → `resolved` / `dismissed`, с фиксацией исполнителя
- План безопасности: при критическом алерте — показ врачу пошагового протокола действий
- Push/email-уведомление дежурному врачу

**Границы:** алерт — сигнал врачу, а не автоматический диагноз и не замена клинического решения.

**Ключевые API:** `GET /alerts`, `GET /alerts/{id}`, `PUT /alerts/{id}`, `PATCH /alerts/{id}`, `GET /alerts/{id}/safety-plan`

**События:** `alert.created` → `notification-service`

---

## Модуль 7. Лекарства и рецепты (`medication-service`)

**Status:** Planned (contract only)

**Назначение:** справочник препаратов, назначения, отслеживание приёма. Подробно — в `MEDICATIONS.md`.

**Функционал MVP:**
- Справочник препаратов: название, МНН, форма, дозировка, производитель, инструкция, противопоказания, побочные действия, взаимодействия
- Назначение рецепта врачом пациенту
- Разделение представлений: полная карточка для врача, сокращённая для пациента
- Отметки приёма пациентом (принял / не принял / пропустил) с расчётом adherence
- Формирование алерта `rx` при систематическом отказе

**Границы:** справочник ведётся вручную администратором; интеграция с ГРЛС в MVP отсутствует (см. `MEDICATIONS.md` §5).

**Ключевые API:** `GET /medications`, `GET /medications/{id}`, `GET /prescriptions`, `POST /prescriptions`, `PUT /prescriptions/{id}`, `POST /adherence`, `GET /adherence`

---

## Модуль 8. Уведомления и сообщения (`notification-service`)

**Status:** Planned

**Назначение:** доставка уведомлений (push/SMS/email) и защищённый обмен сообщениями между врачом и пациентом.

**Функционал MVP:**
- Регистрация push-токена устройства (FCM/APNs), токен хранится в `user_devices`
- Шаблоны уведомлений: новый алерт, пропущенный дневник, назначение упражнения, сообщение от врача
- Очередь доставки через Celery с повторами при сбое
- Переписка врач ↔ пациент (одна нить на пару «пациент + врач»), статус прочтения
- Важно: уведомление не содержит клинических данных (только «у вас новое сообщение в приложении»)

**Границы:** дежурные push-уведомления в MVP реализуются как заглушка с логированием, реальные FCM/APNs-ключи подключаются позже.

**Ключевые API:** `POST /devices/register`, `GET /notifications`, `POST /notifications/test`, `GET /messages`, `POST /messages`, `PATCH /messages/{id}/read`

---

## Смежные модули (обязательные, но не входят в 8 пунктов ТЗ)

| Модуль | Функционал MVP | Ключевые API |
|---|---|---|
| `admin-service` | Сотрудники клиники, роли и права, справочник препаратов, настройки клиники | `GET /admin/employees`, `PUT /admin/employees/{id}`, `GET /admin/analytics`, `GET /admin/settings`, `PUT /admin/settings` |
| `audit-service` | Журнал доступа и изменений критических данных | `GET /audit`, `GET /audit/{id}` |
| `report-service` | Отчёт перед визитом (PDF), выгрузка аналитики клиники | `GET /reports/pre-visit/{patientId}`, `GET /reports/clinic-analytics` |

## Сводная карта модулей и прав

| Модуль | patient | doctor | psychologist | coordinator | clinic_admin | super_admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| auth-service | ✅ own | ✅ own | ✅ own | ✅ own | ✅ own | ✅ own |
| patient-service | ✅ own | ✅ | ✅ | ✅ | ✅ | ✅ |
| screening-service | ✅ own | ✅ | ✅ | ✅ | ✅ | ✅ |
| diary-service | ✅ own | ✅ | ✅ | ✅ | ❌ | ✅ |
| program-service | ✅ own | ✅ | ✅ | ❌ | ❌ | ✅ |
| alert-service | ✅ own | ✅ | ✅ | ✅ | ✅ | ✅ |
| medication-service | ✅ brief | ✅ full | ✅ full | ✅ brief | ✅ full | ✅ full |
| notification-service | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| admin-service | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| audit-service | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| report-service | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |

---

## Clinical Architecture Update — Phase 13/14 (2026-10-23)

### Diagnosis Layer — Реализовано (Phase 13)

- `PatientDiagnosis` реализован: `coding_system` (ICD10/ICD11), `code`, `title`, `is_primary`, `status` (active/remission/resolved/closed), `diagnosed_at`, `ended_at`, `diagnosed_by`, `is_confirmed`, `notes`, `created_at`, `updated_at`.
- Partial unique index: один активный первичный диагноз на пациента.
- API: `/api/v1/diagnoses` (GET/POST/GET/{id}/PUT/{id}), `/api/v1/patients/{id}/diagnoses`.
- Patient Card summary включает диагнозы.
- RBAC: diagnosis:read / diagnosis:write.
- Реализовано (Phase 14): `DiagnosisReference` (справочник МКБ-10/МКБ-11, миграция 0007, seed subset), deprecated alias `/api/v1/icd10`, clinic isolation для diagnosis endpoints, audit logging на create/update.

### ICD-10 / ICD-11 Strategy

Future-proof: `coding_system` (ICD10/ICD11) + `code` + `title`. API exposes coding_system. Backward compat: `/api/v1/icd10` may remain as deprecated alias of `/api/v1/diagnoses?coding_system=ICD10`.

### MBC Layer

Chain: Diagnosis → Assessment Plan → Screening → Trend. `AssessmentPlan` реализован (миграция 0008): patient_id, questionnaire_code, interval_days, enabled, created_by, created_at/updated_at. Optional `SymptomTrend` остаётся планируемым. Screening поддерживает PHQ-9/GAD-7/PDSS/HCL-33/C-SSRS через registry/versioning; MBC добавляет расписание.

### Diary Rework

New scales: mood -3..+3, anxiety 0..4, energy 0..4, functioning 0..4. Add `functioning_score`. Micro-diary (partial entries, nullable fields). Migration: ALTER CHECK constraints + ADD COLUMN; data mapping decision required.

### Safety Plan Architecture

SafetyPlan remains patient-specific entity. Reusable clinical content (AWARE, depression handouts, crisis algorithm, relative/doctor instructions) moves to `SafetyPlanTemplate` / `ClinicalContentLibrary`, referenced via nullable `template_id` + override. Structured contacts (JSONB) and crisis steps.

### Screening Expansion


### Patient Card Requirements

Missing blocks: adherence, screening trends. (Diagnoses, assessment schedule, safety plans, crisis history implemented; see Phase 13/15/17.)
