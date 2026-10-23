# API-контракты — бэкенд «Клинический компас»

**Источник:** `Архитектурный_дизайн_моделей.md` §6, `ТЗ_Клинический_Компас_v1.0.md` §8, роуты `frontend_dev` (ветка `SechHack_26`), экраны Figma  
**Базовый путь:** `/api/v1`  
**Формат ответов:** стандартный конверт `{"data": ..., "meta": {"request_id": "uuid", "timestamp": "..."}, "error": null}`  
**Аутентификация:** Bearer JWT (access token) во всех защищённых эндпоинтах

## 1. Стандартный конверт ответа

```json
{
  "data": {},
  "meta": {
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-10-20T14:30:00Z"
  },
  "error": null
}
```

При ошибке:
```json
{
  "data": null,
  "meta": {
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-10-20T14:30:00Z"
  },
  "error": {
    "code": "validation_error",
    "message": "Некорректный email или пароль"
  }
}
```

Коды `error.code`: `unauthorized`, `forbidden`, `invalid_credentials`, `not_found`, `validation_error`, `rate_limited`, `conflict`, `internal_error`. Подробно — в `AUTH_PLAN.md` §9.

## 2. Аутентификация (`auth-service`)

Два входа: **телефон + SMS** (мобилка, `mobile_dev`) и **email + пароль** (веб, `frontend_dev`). Подробно — `AUTH_PLAN.md` §1, §3.1, §3.2.

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Регистрация (email+пароль, веб) с согласиями (152-ФЗ) | Публичный |
| POST | `/api/v1/auth/login` | Вход по email+пароль, возврат access + refresh токенов | Публичный |
| POST | `/api/v1/auth/sms/request` | Запрос SMS-кода на телефон (регистрация/вход, TTL 5 мин) | Публичный |
| POST | `/api/v1/auth/sms/verify` | Проверка SMS-кода → регистрация/вход, возврат токенов | Публичный |
| POST | `/api/v1/auth/invite/verify` | Проверка invite-кода врача → привязка `patient_assignments` | Публичный (после sms/verify) |
| POST | `/api/v1/auth/refresh` | Обновление access-токена по refresh-токену (rotation) | Публичный |
| POST | `/api/v1/auth/logout` | Инвалидация refresh-токена | Защищённый |
| GET | `/api/v1/auth/me` | Профиль текущего пользователя | Защищённый |
| POST | `/api/v1/auth/change-password` | Смена пароля (email+пароль аккаунты) | Защищённый |

**Пример запроса login (веб):**

```json
POST /api/v1/auth/login
{"email": "doctor@clinic.ru", "password": "secret123"}
```

**Пример запроса SMS-кода (мобилка):**

```json
POST /api/v1/auth/sms/request
{"phone": "+79991234567"}
```

**Пример проверки SMS-кода:**

```json
POST /api/v1/auth/sms/verify
{"phone": "+79991234567", "code": "1234"}
```

**Пример проверки invite-кода (дефис — только маска в UI, на бэкенд приходит без него):**

```json
POST /api/v1/auth/invite/verify
{"code": "RAV27400"}
```

> **QR:** мобилка сканирует QR (`QrScanScreen`) и извлекает тот же invite-код клиентом (`extractInviteCode`), затем вызывает этот же эндпоинт — отдельного API для QR нет.
> **Skip:** пациент может завершить регистрацию без привязки (`onSkip`); повторный вызов `/auth/invite/verify` с обычным JWT привязывает врача позже.

**Пример ответа:**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 900
  },
  "meta": { "request_id": "...", "timestamp": "..." },
  "error": null
}
```

**Пример ответа `/auth/me`:**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "doctor@clinic.ru",
      "role": "doctor",
      "first_name": "Елена",
      "last_name": "Смирнова"
    }
  },
  "meta": { "request_id": "...", "timestamp": "..." },
  "error": null
}
```

## 3. Пациенты и специалисты (`patient-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/patients` | Список пациентов (фильтр по клинике, врачу) | doctor, psychologist, coordinator, clinic_admin |
| GET | `/api/v1/patients/{id}` | Карточка пациента | doctor, psychologist, coordinator, patient (свой профиль) |
| PATCH | `/api/v1/patients/{id}` | Обновить данные пациента | doctor, psychologist, coordinator |
| GET | `/api/v1/patients/{id}/summary` | Сводка к приёму (7/30 дней) | doctor, psychologist |
| GET | `/api/v1/practitioners` | Список специалистов клиники | clinic_admin, super_admin |
| GET | `/api/v1/practitioners/{id}` | Профиль специалиста | clinic_admin, super_admin, doctor |
| GET | `/api/v1/practitioners/{id}/invite-codes` | Список invite-кодов специалиста | doctor, clinic_admin |
| POST | `/api/v1/practitioners/{id}/invite-codes` | Сгенерировать invite-код (алфавит `23456789ABCDEFGHJKLMNPQRSTUVWXYZ`, TTL от врача) | doctor, clinic_admin |

## 4. Скрининги (`screening-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/screenings` | Список версий опросников (PHQ-9, GAD-7) | Защищённый |
| POST | `/api/v1/screenings` | Пройти скрининг, сохранить ответы, подсчёт баллов | patient |
| GET | `/api/v1/screenings/{id}` | Результат скрининга | patient, doctor, psychologist |
| GET | `/api/v1/patients/{id}/screenings` | История скринингов пациента | doctor, psychologist, coordinator |

**Тело запроса `POST /screenings`:**
```json
{
  "questionnaire_type": "phq9",
  "questionnaire_version": "1.0",
  "answers": [
    {"question_id": "q1", "value": 1},
    {"question_id": "q2", "value": 0}
  ]
}
```

Балл считается **на сервере**: клиентский `score` в теле запроса не принимается и игнорируется.

## 5. Дневник (`diary-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/diary` | Записи дневника пациента (фильтр по датам) | patient, doctor, psychologist |
| POST | `/api/v1/diary` | Создать запись дневника | patient |
| PUT | `/api/v1/diary/{id}` | Обновить запись | patient |
| DELETE | `/api/v1/diary/{id}` | Удалить запись | patient |
| POST | `/api/v1/diary/bulk-sync` | Офлайн-синхронизация пакета записей | patient |
| GET | `/api/v1/diary/summary` | Агрегаты за период | patient, doctor, psychologist |

**Тело запроса `POST /diary/bulk-sync`:**
```json
{
  "device_id": "dev-abc-123",
  "entries": [
    {"recorded_at": "2026-10-18T07:30:00Z", "mood_score": 3, "sleep_hours": 6.5, "notes": "..."}
  ]
}
```

Дедупликация — по уникальному индексу `(device_id, recorded_at, patient_id)`. Повторная отправка того же пакета не создаёт дублей.

## 6. Программы и упражнения (`program-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/exercises` | Список упражнений (назначенных пациенту) | patient, doctor, psychologist |
| POST | `/api/v1/exercises` | Назначить упражнение (создать CarePlan + ExerciseAssignment) | doctor, psychologist |
| PUT | `/api/v1/exercises/{id}` | Обновить назначение | doctor, psychologist |
| POST | `/api/v1/exercises/{id}/complete` | Отметить выполнение упражнения | patient |
| GET | `/api/v1/exercises/{id}/compliance` | Приверженность по упражнению | doctor, psychologist |
| GET | `/api/v1/care-plans` | Программы сопровождения пациента | patient, doctor, psychologist |
| POST | `/api/v1/care-plans` | Создать программу | doctor, psychologist |

## 7. Алерты (`alert-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/alerts` | Очередь алертов (фильтр по приоритету, статусу) | doctor, psychologist, coordinator, patient (свои) |
| GET | `/api/v1/alerts/{id}` | Детальная карточка алерта | doctor, psychologist, coordinator, patient (свой) |
| PUT | `/api/v1/alerts/{id}` | Принять алерт в работу, изменить статус | doctor, psychologist |
| PATCH | `/api/v1/alerts/{id}` | Частичное обновление (статус, комментарий) | doctor, psychologist |
| GET | `/api/v1/alerts/{id}/safety-plan` | План безопасности | doctor, psychologist |

**Пример алерта (приоритет `mandatory`):**
```json
{
  "data": {
    "id": "a1",
    "patient_id": "p1",
    "patient_full_name": "Миронова Анна, 34",
    "type": "critical_symptom",
    "priority": "mandatory",
    "status": "new",
    "title": "Критический ответ в опроснике — PHQ-9 п.9 ≥ 1",
    "summary": "PHQ-9, вопрос 9: мысли о смерти/самоповреждении",
    "created_at": "2026-10-20T14:30:00Z",
    "resolved_at": null,
    "resolved_by": null
  },
  "meta": { "request_id": "...", "timestamp": "..." },
  "error": null
}
```

## 7.5. Кризисные сигналы и план безопасности (`crisis-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| POST | `/api/v1/crisis/signal` | Отправить критический сигнал (SOS / вызов 103/112) | patient |
| GET | `/api/v1/crisis/signals` | Список сигналов пациента (фильтр по статусу) | patient, doctor, psychologist, coordinator |
| GET | `/api/v1/crisis/signals/{id}` | Детальная карточка сигнала | patient, doctor, psychologist, coordinator |
| PATCH | `/api/v1/crisis/signals/{id}/acknowledge` | Подтвердить получение сигнала | doctor, psychologist |
| PATCH | `/api/v1/crisis/signals/{id}/resolve` | Закрыть сигнал | doctor, psychologist |

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/safety-plan` | Получить план безопасности пациента | patient, doctor, psychologist |
| POST | `/api/v1/safety-plan` | Создать/обновить план безопасности | doctor, psychologist |

**Пример запроса `POST /crisis/signal`:**
```json
{
  "type": "sos_call",
  "source": "mobile_app",
  "message": "Плохое самочувствие, нужна помощь",
  "location": { "latitude": 55.7558, "longitude": 37.6173 }
}
```

**Пример ответа:**
```json
{
  "data": {
    "id": "cs-1",
    "patient_id": "p1",
    "type": "sos_call",
    "source": "mobile_app",
    "status": "new",
    "priority": "critical",
    "created_at": "2026-10-20T10:42:00Z"
  },
  "meta": { "request_id": "...", "timestamp": "..." },
  "error": null
}
```


**Значения полей:**
- `type`: `critical_symptom` | `adherence` | `missed_diary` | `screening_risk` | `adverse_event`
- `priority`: `mandatory` | `optional` | `rx`
- `status`: `new` | `in_progress` | `resolved` | `dismissed`

## 8. Лекарства (`medication-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/medications` | Список лекарств (полная инфа врачу / упрощённая пациенту) | doctor, psychologist, patient |
| GET | `/api/v1/medications/{id}` | Карточка лекарства | doctor, psychologist, patient |
| GET | `/api/v1/prescriptions` | Назначения пациента | doctor, patient (свои) |
| POST | `/api/v1/prescriptions` | Назначить препарат | doctor |
| PUT | `/api/v1/prescriptions/{id}` | Изменить/деактивировать назначение | doctor |
| GET | `/api/v1/adherence` | История приёма препаратов | patient, doctor |
| POST | `/api/v1/adherence` | Отметить приём | patient, doctor |
| POST | `/api/v1/medications/{id}/skip` | Сообщить о пропуске приёма с причиной | patient, doctor |
| GET | `/api/v1/admin/medications` | Управление справочником | clinic_admin, super_admin |
| POST | `/api/v1/admin/medications` | Добавить препарат в справочник | clinic_admin, super_admin |
| PUT | `/api/v1/admin/medications/{id}` | Обновить препарат | clinic_admin, super_admin |

**Разделение по ролям (реализуется через `response_model`):**
- Врач: полная карточка — состав, противопоказания, побочные действия, взаимодействия, ссылка на ОХЛП/aviandr.ru
- Пациент: сокращённая карточка — название, дозировка, приверженность, статус, краткая инструкция

Подробно — в `MEDICATIONS.md`.


## 8.5. Диагнозы МКБ-10 и C-SSRS (`crisis-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/icd10` | Список диагнозов МКБ-10 пациента | patient, doctor, psychologist |
| POST | `/api/v1/icd10` | Поставить диагноз МКБ-10 | doctor |
| PUT | `/api/v1/icd10/{id}` | Обновить диагноз | doctor |
| GET | `/api/v1/cssrs` | Список оценок C-SSRS пациента | patient, doctor, psychologist |
| POST | `/api/v1/cssrs` | Провести оценку суицидального риска (C-SSRS) | doctor, psychologist |

**Пример запроса `POST /icd10`:**
```json
{
  "patient_id": "p1",
  "code": "F32.1",
  "description": "Депрессивный эпизод средней тяжести",
  "diagnosis_date": "2026-10-20",
  "is_primary": true,
  "is_confirmed": true
}
```

**Пример запроса `POST /cssrs`:**
```json
{
  "patient_id": "p1",
  "assessment_date": "2026-10-20T10:00:00Z",
  "version": "C-SSRS v1.0",
  "suicidal_ideation": true,
  "suicidal_ideation_with_plan": false,
  "suicidal_behavior": false,
  "most_severe_ideation": "suicidal_thoughts",
  "most_severe_behavior": "none",
  "risk_level": "moderate",
  "recommendations": "Рекомендуется план безопасности и динамическое наблюдение"
}
```

## 9. Записи и сообщения (`appointments` / `messaging`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/appointments` | Записи на приём | doctor, patient |
| POST | `/api/v1/appointments` | Создать запись | doctor, coordinator |
| GET | `/api/v1/messages` | Сообщения врач ↔ пациент | doctor, patient |
| POST | `/api/v1/messages` | Отправить сообщение | doctor, patient |
| PATCH | `/api/v1/messages/{id}/read` | Отметить прочитанным | doctor, patient |
| POST | `/api/v1/devices/register` | Зарегистрировать push-токен устройства | Защищённый |

## 10. Уведомления (`notification-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/notifications` | Список уведомлений пользователя | patient, doctor |
| POST | `/api/v1/notifications/test` | Тестовое уведомление (заглушка) | clinic_admin |

## 11. Отчёты (`report-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/reports/pre-visit/{patientId}` | Отчёт перед визитом (PDF) | doctor |
| GET | `/api/v1/reports/clinic-analytics` | Аналитика клиники (KPI) | clinic_admin, super_admin |

## 12. Администрирование (`admin-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/admin/employees` | Список сотрудников с ролями и правами | clinic_admin, super_admin |
| PUT | `/api/v1/admin/employees/{id}` | Обновить роль сотрудника | clinic_admin, super_admin |
| GET | `/api/v1/admin/analytics` | Аналитика клиники (Screening Completion Rate, Activation Rate и т.д.) | clinic_admin, super_admin |
| GET | `/api/v1/admin/settings` | Настройки клиники | clinic_admin, super_admin |
| PUT | `/api/v1/admin/settings` | Обновить настройки клиники | clinic_admin, super_admin |

## 13. Аудит (`audit-service`)

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| GET | `/api/v1/audit` | События доступа и изменения критических данных | clinic_admin, super_admin |
| GET | `/api/v1/audit/{id}` | Детальная запись аудита | clinic_admin, super_admin |

## 14. Коды ответов

| Код | Значение | `error.code` |
|---|---|---|
| 200 | Успех | — |
| 201 | Создано | — |
| 204 | Нет контента (успешное удаление) | — |
| 400 | Некорректный запрос | `validation_error` |
| 401 | Не авторизован | `unauthorized`, `invalid_credentials` |
| 403 | Доступ запрещён (RBAC) | `forbidden` |
| 404 | Не найдено | `not_found` |
| 409 | Конфликт (дубликат) | `conflict` |
| 422 | Ошибка валидации схемы (Pydantic) | `validation_error` |
| 429 | Превышен лимит запросов | `rate_limited` |
| 500 | Внутренняя ошибка сервера | `internal_error` |

## 15. Ограничения по ролям (сводка)

| Действие | patient | doctor | psychologist | coordinator | clinic_admin | super_admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Свой профиль и дневник | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Карточка чужого пациента | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Назначение упражнений | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Назначение препаратов | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Полная карточка лекарства | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Сокращённая карточка лекарства | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Закрытие алертов | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Аналитика | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Аудит | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Управление сотрудниками | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

Полная матрица прав — в `AUTH_PLAN.md` §5.2.

---

## Clinical Architecture Update — Phase 11.0 (2026-10-23)

### Diagnosis Layer

Current `Icd10Code` is a flat record without lifecycle/status/history. It cannot fully support diagnosis history, closure, remission, multiple diagnoses with status, primary diagnosis constraint, or ICD-11. Proposed: `PatientDiagnosis` (coding_system, code, title, is_primary, status, diagnosed_at, ended_at, diagnosed_by, is_confirmed, notes, created_at, updated_at) + `DiagnosisReference` (coding_system, code, title, title_en, chapter, parent_code, is_active, version). Partial unique index: one primary diagnosis per patient.

### ICD-10 / ICD-11 Strategy

Future-proof: `coding_system` (ICD10/ICD11) + `code` + `title`. API exposes coding_system. Backward compat: `/api/v1/icd10` may remain as deprecated alias of `/api/v1/diagnoses?coding_system=ICD10`.

### MBC Layer

Chain: Diagnosis → Assessment Plan → Screening → Trend. Missing: `AssessmentPlan` (patient_id, questionnaire_code, interval_days, enabled, start_date, end_date) and optional `SymptomTrend`. Screening itself already supports PHQ-9/GAD-7/PDSS/HCL-33/C-SSRS via registry/versioning; MBC adds scheduling.

### Diary Rework

New scales: mood -3..+3, anxiety 0..4, energy 0..4, functioning 0..4. Add `functioning_score`. Micro-diary (partial entries, nullable fields). Migration: ALTER CHECK constraints + ADD COLUMN; data mapping decision required.

### Safety Plan Architecture

SafetyPlan remains patient-specific entity. Reusable clinical content (AWARE, depression handouts, crisis algorithm, relative/doctor instructions) moves to `SafetyPlanTemplate` / `ClinicalContentLibrary`, referenced via nullable `template_id` + override. Structured contacts (JSONB) and crisis steps.

### Screening Expansion

Already supported via Questionnaire Registry/versioning: PHQ-9, GAD-7. PDSS, HCL-33, C-SSRS require registry entries + scoring rules + critical rules; no core architecture change, but C-SSRS is clinical safety instrument (consider dedicated entity).

### Patient Card Requirements

Missing blocks: diagnoses (active + history + primary), assessment schedule, adherence, safety plans, crisis history, screening trends.
