# BACKEND_SPEC.md — Единая спецификация бэкенда «Клинический компас» (MVP)

**Статус:** актуальная спецификация (source of truth для реализации)  
**Язык:** Python 3.11+ · FastAPI · SQLAlchemy 2.0 (async) · PostgreSQL 15+  
**Порт:** 3001 · **База:** `sechhack` (одна БД, логическое разделение concept01/concept02)  
**Мобильный клиент:** React Native + Expo (`mobile_dev`, ветка `mobile_dev`)  
**Веб-клиент:** React + Vite + TypeScript (`frontend_dev`, ветка `frontend_dev`)  
**ML/эксперименты:** `ml_dev` (ветка `ml_dev`)

> **Правило:** код и миграции — source of truth. Где документация противоречит коду — приоритет за кодом.  
> Пример контрадикции: `DOMAIN_MODEL.md` §7 и `DB_SCHEMA.md` §7 указывают `mood_score BETWEEN 1 AND 5`, а миграция `0011_diary_entries.py` и модель `app/models/clinical.py` используют `mood_score BETWEEN -3 AND 3`. Актуальное значение — из кода/миграции.

---

## 1. Стек и границы MVP

| Компонент | Решение | Обоснование |
|-----------|---------|-------------|
| Язык | Python 3.11+ | Быстрая разработка, экосистема ML/данных |
| Веб-фреймворк | FastAPI | REST + авто-OpenAPI, высокая скорость прототипирования |
| ORM | SQLAlchemy 2.0 (async) | Типизация, миграции Alembic |
| Валидация | Pydantic v2 | Схемы запросов/ответов |
| БД | PostgreSQL 15+ | Environment variables (`.env.example`) |
| Кеш/очереди | Redis + Celery | Уведомления, алерты, фоновые отчёты (планируется, не реализовано в коде) |
| Аутентификация | JWT (access 15 мин, refresh 7 дней), argon2id; телефон+SMS (мобилка) и email+пароль (веб) | 152-ФЗ, минимальные затраты |
| Мобильный клиент | React Native + Expo | Решение команды |
| Веб-клиент | React + Vite + TS | Уже в разработке |
| Инфраструктура | Docker Compose | Развёртывание на сервере клиники |

### Что НЕ входит в текущий спринт

- Keycloak / OIDC — отложено на Релиз 2
- Разделение concept01/concept02 на уровне БД (логическое разделение в одной БД)
- Парсинг ГРЛС через API pharm-portal.ru — данные по лекарствам согласно экранам Figma
- Redis/Celery — настроены в конфиге, но не используются в коде (in-memory rate limit)

---

## 2. Клиенты, ждущие API

В `SechHack_26` уже реализованы клиентские приложения — бэкенд пишется под них:

| Клиент | Ветка | Что готово | Зависимость от API |
|--------|-------|------------|-------------------|
| Веб-кабинет врача | `frontend_dev` | Dashboard, пациенты, карточка, отчёт перед визитом, план лечения, сообщения, алерты, лекарства, упражнения, админка | Работает на mock-данных (`src/data/mock*.ts`); нужен REST `/api/v1/*` |
| Мобильное приложение | `mobile_dev` | Регистрация: телефон → SMS-код (4 цифры) → согласия 152-ФЗ → invite-код врача / QR | Нужны `/auth/sms/request`, `/auth/sms/verify`, `/auth/invite/verify`; базовый URL `http://localhost:3001` |

## 3. Доменная модель (сущности и связи)

Первичные ключи: UUID. Временные метки: UTC ISO-8601. Одна БД PostgreSQL.

### 3.1 Общий контур (concept01)

#### `User`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `email` | String (unique, nullable) | Уникальный email (email+пароль вход) |
| `phone` | String (unique, nullable) | Телефон в E.164 (телефон+SMS вход) |
| `phone_verified` | Boolean | Подтверждён ли телефон SMS-кодом |
| `password_hash` | String (nullable) | argon2id хеш (только для email+пароль аккаунтов) |
| `token_version` | Integer | Версия токена для глобального отзыва refresh-сессий |
| `role` | Enum | `patient`, `doctor`, `psychologist`, `coordinator`, `clinic_admin`, `super_admin` |
| `is_active` | Boolean | Активен ли аккаунт |
| `created_at` / `updated_at` | DateTime | Метки времени |
| `last_login_at` | DateTime (nullable) | Дата последнего входа |

#### `PatientProfile`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `user_id` | UUID (FK → User.id) | Ссылка на пользователя |
| `first_name` / `last_name` / `middle_name` | String | ФИО |
| `birth_date` | Date | Дата рождения |
| `gender` | Enum | `male`, `female`, `other`, `prefer_not_to_say` |
| `phone` | String (nullable) | Телефон |
| `consent_personal_data` / `consent_medical_data` | Boolean NOT NULL | Согласия (152-ФЗ) |
| `consent_data_processing_at` | DateTime (nullable) | Дата проставления согласий |
| `clinic_id` | UUID (FK → Clinic.id, nullable) | Привязанная клиника |
| `created_at` / `updated_at` | DateTime | Метки времени |

#### `Message`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `sender_id` | UUID NOT NULL (FK → User.id) | Отправитель |
| `recipient_id` | UUID NOT NULL (FK → User.id) | Получатель |
| `patient_id` | UUID (nullable, FK → PatientProfile.id) | Контекст пациента |
| `body` | Text NOT NULL | Текст сообщения |
| `is_read` | Boolean DEFAULT FALSE | Прочитано |
| `created_at` | DateTime | Время отправки |
| `read_at` | DateTime (nullable) | Время прочтения |

**Бизнес-правила:** чат между пациентом и врачом; сообщения считаются append-only в базовой модели; состояние прочтения фиксируется через `is_read` / `read_at`. В плане будущих фаз возможны `is_edited`, `edited_at`, `deleted_at`, `is_deleted`, `edit_count` без изменения `created_at`.

#### `PractitionerProfile`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `user_id` | UUID (FK → User.id) | Ссылка на пользователя |
| `first_name` / `last_name` / `middle_name` | String | ФИО |
| `specialization` | Enum | `psychiatrist`, `psychotherapist`, `psychologist`, `nurse`, `registrar` |
| `license_number` | String (nullable) | Номер лицензии |
| `clinic_id` | UUID NOT NULL (FK → Clinic.id) | Клиника |
| `is_active` | Boolean | Активен |
| `created_at` | DateTime | Дата создания |

#### `PatientAssignment`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `patient_id` | UUID NOT NULL (FK → PatientProfile.id) | Пациент |
| `practitioner_id` | UUID NOT NULL (FK → PractitionerProfile.id) | Врач |
| `clinic_id` | UUID NOT NULL (FK → Clinic.id) | Клиника |
| `is_active` | Boolean DEFAULT TRUE | Активно |
| `assigned_at` | DateTime | Время назначения |

**Бизнес-правила:** уникальность (`patient_id`, `practitioner_id`, `clinic_id`); при смене врача старое назначение закрывается с причиной и датой окончания, создаётся новое.

#### `PractitionerSchedule`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `practitioner_id` | UUID NOT NULL (FK → PractitionerProfile.id) | Врач |
| `clinic_id` | UUID NOT NULL (FK → Clinic.id) | Клиника |
| `weekday` | Integer NOT NULL CHECK (0..6) | День недели (0=пн) |
| `start_time` | Time NOT NULL | Начало рабочего интервала |
| `end_time` | Time NOT NULL | Конец рабочего интервала |
| `is_available` | Boolean DEFAULT TRUE | Доступен в этот интервал |
| `created_at` / `updated_at` | DateTime | Метки времени |

#### `PractitionerScheduleException`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `practitioner_id` | UUID NOT NULL (FK → PractitionerProfile.id) | Врач |
| `clinic_id` | UUID NOT NULL (FK → Clinic.id) | Клиника |
| `date` | Date NOT NULL | Дата исключения |
| `start_time` | Time (nullable) | Начало (null = весь день) |
| `end_time` | Time (nullable) | Конец (null = весь день) |
| `is_available` | Boolean NOT NULL | Доступен/недоступен в период |
| `reason` | String (nullable) | Причина |
| `created_at` | DateTime | Дата создания |

#### `Clinic`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `name` | String NOT NULL | Название клиники |
| `address` | Text | Адрес |
| `inn` | String (nullable) | ИНН |
| `is_active` | Boolean | Активна |
| `created_at` / `updated_at` | DateTime | Метки времени |

#### `ClinicSettings`

| Поле | Тип | Описание |
|------|-----|----------|
| `clinic_id` | UUID PK/FK → Clinic.id | Клиника (1:1) |
| `timezone` | String NOT NULL | IANA timezone, например `Europe/Moscow` |
| `created_at` / `updated_at` | DateTime | Метки времени |

`ClinicSettings` хранит `timezone` клиники (IANA). Расписание интерпретируется в timezone клиники; чат остаётся доступным 24/7, расписание влияет только на UX-индикаторы (`is_available_now`, `next_available_at`) и SLA.

#### `ScreeningResult`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `patient_id` | UUID NOT NULL (FK → PatientProfile.id) | Пациент |
| `questionnaire_type` | String NOT NULL | `phq9`, `gad7`, `ymrs` |
| `questionnaire_version` | String NOT NULL | Версия опросника |
| `score` | Integer NOT NULL CHECK (`score >= 0`) | Суммарный балл |
| `answers` | JSONB (nullable) | Ответы `{question_id: value}` — для правила «PHQ-9 п.9 ≥ 1» |
| `is_critical` | Boolean DEFAULT FALSE | Критический результат |
| `severity` | String (nullable) | Интерпретация |
| `critical_reason` | String (nullable) | Причина критичности |
| `created_at` | DateTime DEFAULT NOW() | Дата создания |

#### `DiaryEntry`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `patient_id` | UUID NOT NULL (FK → PatientProfile.id) | Пациент |
| `recorded_at` | DateTime NOT NULL | Дата записи |
| `mood_score` | Integer | CHECK: `mood_score BETWEEN -3 AND 3` (актуальное значение из миграции 0011) |
| `anxiety_score` | Integer | CHECK: `anxiety_score BETWEEN 0 AND 4` |
| `energy_score` | Integer | CHECK: `energy_score BETWEEN 0 AND 4` |
| `functioning_score` | Integer | CHECK: `functioning_score BETWEEN 0 AND 4` |
| `sleep_hours` | Float (nullable) | Часы сна |
| `sleep_quality` | Integer (nullable) | Качество сна 0..4 |
| `notes` | Text (nullable) | Заметки |
| `device_id` | String(100) (nullable) | ID устройства для офлайн-синхронизации |
| `synced_at` | DateTime (nullable) | Время синхронизации |
| `created_at` | DateTime DEFAULT NOW() | Дата создания |

> **Важно:** Документы `DOMAIN_MODEL.md` §7 и `DB_SCHEMA.md` §7 ранее указывали диапазоны `mood_score BETWEEN 1 AND 5` и `anxiety_score BETWEEN 1 AND 5`. Актуальные значения — из миграции `0011_diary_entries.py` и модели `app/models/clinical.py`: `mood_score BETWEEN -3 AND 3`, `anxiety_score BETWEEN 0 AND 4`.

#### `PatientDiagnosis`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `patient_id` | UUID NOT NULL (FK → PatientProfile.id) | Пациент |
| `coding_system` | String NOT NULL | `ICD10` / `ICD11` |
| `code` | String NOT NULL | Код диагноза |
| `title` | String (nullable) | Название |
| `is_primary` | Boolean DEFAULT FALSE | Первичный диагноз |
| `status` | String DEFAULT `active` | `active`, `remission`, `resolved`, `closed` |
| `diagnosed_at` | DateTime DEFAULT NOW() | Дата диагноза |
| `ended_at` | DateTime (nullable) | Дата окончания |
| `diagnosed_by` | UUID (nullable, FK → User.id) | Кто поставил диагноз |
| `is_confirmed` | Boolean DEFAULT TRUE | Подтверждён |
| `notes` | Text (nullable) | Заметки |
| `created_at` / `updated_at` | DateTime DEFAULT NOW() | Метки времени |

**Ограничение:** частичный UNIQUE-индекс — один активный первичный диагноз на пациента (`is_primary = true AND status = 'active'`).

#### `DiagnosisReference`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `coding_system` | String NOT NULL | `ICD10` / `ICD11` |
| `code` | String NOT NULL | Код |
| `title` | String NOT NULL | Название |
| `title_en` | String (nullable) | Название на английском |
| `chapter` | String (nullable) | Глава МКБ |
| `parent_code` | String (nullable) | Родительский код |
| `is_active` | Boolean DEFAULT TRUE | Активен |
| `version` | String (nullable) | Версия справочника |
| `created_at` / `updated_at` | DateTime DEFAULT NOW() | Метки времени |

**Ограничение:** UNIQUE(`coding_system`, `code`).

#### `CarePlan`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `patient_id` | UUID NOT NULL (FK → PatientProfile.id) | Пациент |

#### `Alert`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `patient_id` | UUID NOT NULL (FK → PatientProfile.id) | Пациент |
| `type` | String NOT NULL | `critical_symptom`, `adherence`, `missed_diary`, `screening_risk`, `adverse_event` |
| `priority` | String NOT NULL | `mandatory`, `optional`, `rx` |
| `status` | String DEFAULT `new` | `new`, `in_progress`, `resolved`, `dismissed` |
| `title` | String NOT NULL | Заголовок |
| `summary` | Text (nullable) | Описание |
| `created_at` | DateTime DEFAULT NOW() | Дата создания |
| `resolved_at` | DateTime (nullable) | Дата разрешения |
| `resolved_by` | UUID (nullable, FK → User.id) | Кто разрешил |

### 3.2 Рецептурный контур (concept02, схема `rx`)

#### `rx.medications`

| Поле | Обяз. | Правило |
|------|:---:|---|
| `name` | ✅ | Торговое название |
| `international_name` | ❌ | МНН для поиска и группировки |
| `dosage_form` | ❌ | Форма выпуска (таблетки, капсулы и т.д.) |
| `strength` | ❌ | Дозировка (например «10 мг») |
| `manufacturer` | ❌ | Производитель |
| `instructions_url` | ❌ | Ссылка на официальную инструкцию |
| `contraindications` | ❌ | Только полный контур (врач) |
| `side_effects` | ❌ | Только полный контур (врач) |
| `interactions` | ❌ | Только полный контур (врач) |
| `patient_instruction` | ❌ | Краткая инструкция для пациента |
| `created_at` / `updated_at` | ✅ | Метки времени |

#### `rx.prescriptions`

| Поле | Обяз. | Правило |
|------|:---:|---|
| `patient_id` | ✅ | Пациент |
| `practitioner_id` | ✅ | Назначил врач |
| `medication_id` | ✅ | Препарат из справочника |
| `dosage` | ✅ | Дозировка |
| `frequency` | ✅ | Частота |
| `start_date` | ✅ | Дата начала |
| `end_date` | ✅ | Дата окончания курса |
| `is_active` | ✅ | Флаг активности |
| `created_at` / `updated_at` | ✅ | Метки времени |

**Бизнес-правила:** назначение создаёт только врач (`prescription:write`); снятие — `is_active=false` (не удаление); одновременно активных назначений одного препарата у пациента не должно быть.

#### `rx.medication_adherence`

| Поле | Обяз. | Правило |
|------|:---:|---|
| `prescription_id` | ✅ | Ссылка на назначение |
| `taken_at` | ✅ | Плановое время приёма |
| `is_taken` | ✅ | `true` — принял, `false` — пропустил |
| `note` | ❌ | Заметка пациента |

**Бизнес-правила:** отметка может поставить владелец назначения или врач; UNIQUE(`prescription_id`, `taken_at`); adherence = taken / planned за период; три пропуска подряд → алерт `adherence` приоритета `rx`.

### 3.3 Безопасность и кризис

#### `SafetyPlan`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `patient_id` | UUID NOT NULL (FK → PatientProfile.id) | Пациент |
| `title` | String NOT NULL | Название плана |
| `content` | JSONB | Структура плана (шаги, контакты) |
| `template_id` | UUID (nullable) | Ссылка на шаблон (планируется) |
| `created_at` / `updated_at` | DateTime DEFAULT NOW() | Метки времени |

#### `CrisisSignal`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `patient_id` | UUID NOT NULL (FK → PatientProfile.id) | Пациент |
| `source` | String NOT NULL | `screening_result`, `manual`, `system` |
| `severity` | String NOT NULL | Уровень критичности |
| `acknowledged` | Boolean DEFAULT FALSE | Признак опознания врачом |
| `created_at` | DateTime DEFAULT NOW() | Дата создания |

#### `AssessmentPlan` (MBC layer)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `patient_id` | UUID NOT NULL (FK → PatientProfile.id) | Пациент |
| `questionnaire_code` | String NOT NULL | Код опросника из реестра |
| `interval_days` | Integer NOT NULL | Интервал в днях |
| `enabled` | Boolean DEFAULT TRUE | Активен ли план |
| `created_by` | UUID (FK → User.id) | Кто создал |
| `created_at` / `updated_at` | DateTime DEFAULT NOW() | Метки времени |

#### `IntegrationEvent`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `source_system` | String NOT NULL | `clinicalcompass` / `mis` / `emergency` |
| `target_system` | String NOT NULL | `mis` / `emergency` / `clinicalcompass` |
| `event_type` | String NOT NULL | `screening.result.created` и т.д. |
| `entity_type` | String NOT NULL | `screening_result`, `alert`, `patient` |
| `entity_id` | UUID (nullable) | ID сущности |
| `idempotency_key` | String NOT NULL UNIQUE | Ключ идемпотентности |
| `status` | String NOT NULL DEFAULT `pending` | `pending`, `sent`, `failed`, `dead_letter` |
| `payload` | JSONB NOT NULL DEFAULT `{}` | Полезная нагрузка |
| `response` | JSONB (nullable) | Ответ внешней системы |
| `retry_count` | Integer NOT NULL DEFAULT 0 | Количество попыток |
| `next_retry_at` | DateTime (nullable) | Время следующей попытки |
| `created_at` / `updated_at` | DateTime DEFAULT NOW() | Метки времени |

#### `AuditLog`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `user_id` | UUID (nullable) | Пользователь |
| `action` | String NOT NULL | Тип действия (whitelist) |
| `entity_type` | String NOT NULL | Тип сущности |

## 4. Ограничения целостности

- `screening_results.score` — CHECK: `score >= 0` + диапазоны по типу опросника (PHQ-9 ≤ 27, GAD-7 ≤ 21, YMRS ≤ 60, HCL-8 ≤ 8, PDSS ≤ 28, C-SSRS ≤ 6, ISI ≤ 28, HCL-33 ≤ 33). Ограничение `chk_screening_score_range` расширено миграцией `0015_screening_registry`. При downgrade `0015` ограничение создаётся с `NOT VALID`, чтобы rollback работал даже при наличии строк с новыми типами вопросников; такие строки сохраняются, но новые вставки/обновления проверяются.
- `diary_entries.mood_score` — CHECK: `mood_score BETWEEN -3 AND 3` (актуальное значение из кода)
- `diary_entries.anxiety_score` — CHECK: `anxiety_score BETWEEN 0 AND 4`
- `diary_entries.energy_score` — CHECK: `energy_score BETWEEN 0 AND 4`
- `diary_entries.functioning_score` — CHECK: `functioning_score BETWEEN 0 AND 4`
- `patient_profiles.consent_personal_data` / `consent_medical_data` — NOT NULL
- Частичный UNIQUE-индекс по (`device_id`, `recorded_at`, `patient_id`) в `diary_entries` (дедупликация офлайн-синхронизации)
- Частичный UNIQUE-индекс по (`patient_id`) где `is_primary = true AND status = 'active'` в `patient_diagnoses`
- UNIQUE(`coding_system`, `code`) в `diagnosis_references`
- UNIQUE(`idempotency_key`) в `integration_events`

---

## 5. Архитектура и модули

### 5.1 Принципы

| Принцип | Реализация |
|---------|------------|
| **Модульный монолит** | Все сервисы в одном репозитории, чёткие границы модулей, возможность выноса в микросервисы позже |
| **Одна БД** | PostgreSQL; логическое разделение concept01 (общий) и concept02 (рецептурный); параметры подключения через environment variables |
| **Синхронный API** | REST over HTTP (JSON), OpenAPI/Swagger через FastAPI |
| **Асинхронные события** | Redis Pub/Sub + Celery — планируется (сейчас не реализовано) |
| **Офлайн-синхронизация** | Оптимистичная репликация + флаг `synced_at` — планируется |
| **Минимально необходимый доступ** | RBAC, доступ к медданным только по служебной необходимости |

### 5.2 Реализованные модули (актуальный код)

| Модуль | Файлы | Статус | Эндпоинты |
|--------|-------|--------|-----------|
| `auth-service` | `auth.py`, `auth_service.py`, `jwt.py`, `passwords.py` | ✅ Реализован | register, login, sms/request, sms/verify, invite/verify, refresh, logout, me, change-password |
| `patient-service` | `patients.py`, `patient_service.py`, `patient_repository.py` | ✅ Реализован | GET/POST patients, GET/PATCH patient/{id}, summary, diagnoses, screenings |
| `screening-service` | `screenings.py`, `screening_service.py`, `screening_repository.py` | ✅ Реализован | screenings, patient screenings, questionnaires |
| `alert-service` | `alerts.py`, `alert_service.py`, `alert_repository.py` | ✅ Реализован | alerts (GET, PUT, PATCH, safety-plan) |
| `diary-service` | `diary.py`, `diary_repository.py`, `clinical.py` (DiaryEntry) | ✅ Реализован | diary (CRUD), bulk-sync, summary, today; users (/me); qr (/invite) |
| `diagnosis-service` | `diagnoses.py`, `diagnosis.py` | ✅ Реализован | diagnoses, icd10 (deprecated alias), patient diagnoses |
| `assessment-plan` | `assessment_plans.py`, `care.py` (CarePlan) | ✅ Реализован | assessment-plans (CRUD) |
| `safety-service` | `safety.py` | ✅ Реализован | safety/plans, safety/crisis-signals |
| `exercise-service` | `exercises.py`, `exercise_service.py`, `exercise_repository.py` | ✅ Реализован | care-plans (CRUD), exercises (list/detail/create/update/deactivate/complete/compliance) |
| `medication-service` | `medications.py`, `medication_service.py`, `medication_repository.py`, `medication.py` (models), `medication.py` (schemas) | ✅ Реализован | medications (list/detail), prescriptions (CRUD, deactivate, adherence-rate), adherence (list/create/correct) |
| `integrations` | `integrations.py`, `base.py`, `emergency_adapter.py`, `mis_adapter.py`, `fhir_mapper.py` | ✅ Частично | integration events router |
| `message-service` | `messages.py`, `message_service.py`, `message_repository.py`, `message.py` (model/schema) | ✅ Реализован | messages (list/create/get/read-state), SLA availability (`/sla/{practitioner_id}`) |
| `appointment-service` | `appointments.py`, `appointment_service.py`, `appointment_repository.py`, `appointment.py` (model/schema) | ✅ Реализован | appointments (list/create) |
| `assignment-service` | `assignments.py`, `assignment_service.py`, `assignment_repository.py` | ✅ Реализован | assignments (create/list/deactivate) |

### 5.3 Отсутствующие модули (документированы, не реализованы в коде)

| Модуль | Документировано в | Статус в коде |
|--------|-------------------|---------------|
| `report-service` | MODULES.md §10 | Роутер `/api/v1/reports` реализован (pre-visit, clinic-analytics) |
| `admin-service` | MODULES.md §10 | Роутер `/api/v1/admin` реализован (staff, role change) |
| `audit-service` (API) | AUTH_PLAN.md §6 | Роутер `/api/v1/audit` реализован (чтение логов) |

### 5.4 Сводная карта прав (из MODULES.md)

| Модуль | patient | doctor | psychologist | coordinator | clinic_admin | super_admin |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|
| auth-service | ✅ own | ✅ own | ✅ own | ✅ own | ✅ own | ✅ own |
| patient-service | ✅ own | ✅ | ✅ | ✅ | ✅ | ✅ |
| screening-service | ✅ own | ✅ | ✅ | ✅ | ✅ | ✅ |
| diary-service | ✅ own | ✅ | ✅ | ✅ | ❌ | ✅ |
| program-service | ✅ own | ✅ | ✅ | ❌ | ❌ | ✅ |
| alert-service | ✅ own | ✅ | ✅ | ✅ | ✅ | ✅ |
| medication-service | ✅ brief | ✅ full | ✅ full | ✅ brief | ✅ full | ✅ full |
| admin-service | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| audit-service | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| report-service | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |

### 5.5 Что НЕ делаем на старте

- Выделение concept02 в отдельную БД — только логическое разделение
- Keycloak / OIDC — только собственные JWT
- Парсинг ГРЛС через API — данные по лекарствам согласно экранам Figma
- Redis/Celery — планируется, не реализовано
- Полная реализация всех 11 сервисов — поэтапно согласно TASKS.md

| `entity_id` | UUID NOT NULL | ID сущности |
| `old_values` | JSONB (nullable) | Старые значения (без секретов) |

## 6. Аутентификация и авторизация (AUTH_PLAN.md + API_CONTRACTS.md)

### 6.1 Два способа входа

| Способ | Клиент | Идентификатор | Подтверждение | Пароль |
|--------|--------|---------------|---------------|--------|
| Телефон + SMS-код | Мобильное приложение | `phone` (E.164) | 4-значный SMS-код, TTL 5 мин | Не требуется |
| Email + пароль | Веб-кабинет | `email` | — | Argon2id |

Оба способы выдают одинаковую пару access/refresh токенов. Пользователь может иметь и email, и phone.

### 6.2 Схема токенов

| Параметр | Access token | Refresh token |
|----------|-------------|---------------|
| Срок жизни | 15 минут | 7 дней |
| Формат | JWT (HS256) | JWT (HS256) |
| Содержимое | `sub`, `role`, `clinic_id`, `jti`, `type=access`, `exp`, `iat` | `sub`, `jti`, `type=refresh`, `exp`, `iat`, `token_version` |
| Отзыв | Неявный по `exp` | Явный: `refresh_tokens` + `token_version` пользователя |

**Refresh rotation:** при каждом `/auth/refresh` старый refresh-токен помечается отозванным, выдаётся новая пара. При попытке повторного использования уже отозванного токена — отзыв всех refresh-токенов пользователя (признак компрометации).

### 6.3 Хеширование паролей

- Алгоритм: **Argon2id** (`argon2-cffi`)
- Параметры Argon2id: `time_cost=3`, `memory_cost=64 MiB`, `parallelism=4`, `hash_len=32`, `salt_len=16`
- Политика: минимум 10 символов, буквы разных регистров и цифра
- Для телефон+SMS входа пароль не создаётся (`users.password_hash = NULL`)

### 6.4 SMS-код

| Параметр | Значение |
|----------|----------|
| Длина кода | 4 цифры |
| TTL | 5 минут |
| Повторная отправка | Rate limit: не чаще 1 раза в 60 секунд на номер |
| Проверка | Однократное использование; после успеха — `phone_verified = TRUE` |
| В prod | Интеграция с SMS-провайдером; в dev — код логируется |

### 6.5 Invite-код (привязка к врачу)

| Параметр | Значение |
|----------|----------|
| Алфавит | `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (32 символа) |
| `schedule:read` | все роли |
| `schedule:write` | doctor, clinic_admin, super_admin |
| `clinic_settings:read` | все роли |
| `clinic_settings:write` | clinic_admin, super_admin |

| Формат | `PREFIX-NNNNN`, например `RAV-27400`; дефис — только маска в UI, на бэкенд без дефиса |
| Длина | Префикс врача/клиники + 5 символов из алфавита |
| TTL | Задаёт врач при генерации |
| Назначение | Привязка пациента к врачу: `POST /api/v1/auth/invite/verify` → `patient_assignments` |

### 6.6 RBAC матрица (AUTH_PLAN.md §5.2)

Deny by default. `super_admin` имеет все права.

| Право | Роли |
|-------|------|
| `patient:read:self` | patient, super_admin |
| `patient:read:any` | doctor, psychologist, coordinator, clinic_admin, super_admin |
| `patient:write` | doctor, psychologist, coordinator, super_admin |
| `screening:write` | patient |
| `screening:read` | все роли |
| `diary:write` | patient |
| `diary:read` | patient, doctor, psychologist, coordinator, super_admin |
| `exercise:assign` | doctor, psychologist, super_admin |
| `exercise:complete` | patient |
| `alert:read` | все роли |
| `alert:resolve` | doctor, psychologist, super_admin |
| `medication:read:full` | doctor, psychologist, clinic_admin, super_admin |
| `medication:read:brief` | patient, doctor, psychologist, coordinator, super_admin |
| `prescription:write` | doctor, super_admin |
| `prescription:read` | patient, doctor, super_admin |
| `appointment:read` | patient, doctor, psychologist, coordinator, super_admin |
| `appointment:write` | doctor, psychologist, coordinator, super_admin |
| `message:read` | patient, doctor, psychologist, coordinator, super_admin |
| `analytics:read` | doctor, psychologist, coordinator, clinic_admin, super_admin |
| `audit:read` | clinic_admin, super_admin |
| `employee:manage` | clinic_admin, super_admin |
| `clinic:manage` | super_admin |
| `diagnosis:read` | все роли |
| `diagnosis:write` | doctor, super_admin |
| `safety:read` | все роли |
| `safety:write` | doctor, psychologist, super_admin |
| `crisis:read` | все роли |
| `assessment:read` | все роли |
| `assessment:write` | doctor, super_admin |
| `crisis:write` | patient, doctor, psychologist, coordinator, super_admin |

### 6.7 Аудит (AUTH_PLAN.md §6)

События записываются в `audit_logs` с whitelist полей. Известные действия: `auth.register`, `auth.login`, `auth.logout`, `auth.refresh`, `auth.revoke_all`, `auth.password_change`, `auth.sms_verify`, `invite.verify`, `patient.read`, `patient.update`, `prescription.create`, `prescription.update`, `alert.resolve`, `alert.created`, `alert.dismiss`, `alert.updated`, `employee.role_change`, `assessment_plan.create`, `assessment_plan.update`, `assessment_plan.delete`, `clinic_settings.update`, `schedule.create`, `schedule.update`, `schedule.delete`, `schedule_exception.create`, `schedule_exception.delete`.

Поля `password`, `token`, `secret`, `code_hash`, `authorization` никогда не пишутся в аудит-логи.

### 6.8 Защита эндпоинтов (AUTH_PLAN.md §8)

- Хеширование паролей: Argon2id
- Защита от брутфорса: rate limit 5 попыток на email за 15 мин (Redis)
- Защита от SMS-spam: 1 SMS в 60 сек, 5 SMS в час на номер
- Единый ответ 401 «Некорректный email или пароль» (защита от перечисления)
- HTTPS на уровне reverse proxy
- CORS whitelist из `.env.example`

## 7. Стратегия тестирования (TESTS.md)

### 7.1 Стек тестирования

| Инструмент | Назначение |
|------------|------------|
| `pytest` | Раннер |
| `pytest-asyncio` | Асинхронные тесты (`asyncio_mode = auto`) |
| `httpx.AsyncClient` | Вызовы ASGI-приложения |
| `pytest-cov` | Покрытие |
| `testcontainers[postgres]` | Изолированный PostgreSQL в CI |
| `fakeredis` | Подмена Redis в unit-тестах |

### 7.2 Структура тестов

```
backend/
├── tests/
│   ├── conftest.py              # фикстуры: db session, app, client, фабрики
│   ├── unit/                    # изолированные, без БД
│   ├── integration/             # с БД, без HTTP
│   ├── api/                     # через HTTP-клиент
│   └── security/                # security-тесты
```

### 7.3 Покрытие по модулям

| Модуль | Что обязательно проверяется |
|--------|----------------------------|
| `auth-service` | Регистрация с согласиями; логин верный/неверный; refresh rotation; повторное использование отозванного refresh → отзыв всех; выход; смена роли |
| `patient-service` | Список пациентов клиники; карточка; изоляция между клиниками; пациент видит только себя |
| `screening-service` | Подсчёт PHQ-9/GAD-7; границы интерпретации; крит. флаг при п.9 ≥ 1; серверный подсчёт (клиент не влияет) |
| `diary-service` | CRUD; bulk-sync дедупликация по `(device_id, recorded_at, patient_id)`; CHECK-ограничения шкал |
| `program-service` | Назначение упражнения врачом; отметка выполнения пациентом; расчёт adherence |
| `alert-service` | Создание алерта по правилам; приоритет; жизненный цикл; план безопасности для `mandatory` |
| `medication-service` | **Пациент не получает** `contraindications`/`interactions`/`side_effects`; врач получает; назначение только врачом; adherence-расчёт |
| `admin-service` | Список сотрудников; смена роли; аналитика; аудит |
| `audit-service` | Запись события при чтении карточки пациента и изменении роли; пароли/токены не попадают в лог |

### 7.4 Обязательные security-тесты

| Тест | Проверяемое правило |
|------|---------------------|
| `test_rbac_enforcement` | Каждый эндпоинт недоступен для роли без соответствующего права (403) |
| `test_ownership_isolation` | Пациент A не может читать/менять данные пациента B (403/404) |
| `test_patient_view_leak` | В ответе пациенту нет врачебных полей по лекарствам и нет полей чужих пациентов |
| `test_token_rotation` | Refresh-токен одноразовый; повторное использование → 401 и отзыв сессий |
| `test_expired_token` | Просроченный access-токен → 401 |
| `test_password_hashing` | В БД хранится argon2-хеш, не пароль |
| `test_rate_limit` | 6-я попытка входа с тем же email за 15 минут → 429 |
| `test_sql_injection` | Параметры запроса с `' OR 1=1 --` не влияют на выборку |
| `test_audit_no_secrets` | В `audit_logs` нет паролей и токенов |
| `test_mass_assignment` | Нельзя передать `role`/`clinic_id` в теле запроса на самостоятельное изменение |

### 7.5 Пороги качества (CI-gate)

| Метрика | Порог |
|---------|-------|
| Покрытие строк | ≥ 80 % |
| Покрытие ветвлений | ≥ 70 % |
| Покрытие модулей `auth`, `medication`, `alert` | ≥ 90 % |
| Пройденных тестов | 100 % |
| Flaky-тесты | 0 |

### 7.6 Запуск

```bash
# Все тесты
pytest

# Только быстрые unit-тесты (без БД)
pytest tests/unit -m "not db"

# С покрытием
pytest --cov=app --cov-report=term-missing --cov-report=html

# Только security
pytest tests/security -v
```

- Заголовки: `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `X-Frame-Options: DENY`
- Ограничение размера тела: 1 MB (защита от DoS на bulk-sync)
- Валидация входа: Pydantic v2
- SQL-инъекции: только параметризованные запросы через SQLAlchemy
- Единый обработчик ошибок: клиенту `code` + `message`, в лог — полный traceback

| `new_values` | JSONB (nullable) | Новые значения (без секретов) |
| `created_at` | DateTime DEFAULT NOW() | Дата создания |

**Поля `password`, `token`, `secret`, `code_hash`, `authorization` никогда не пишутся в аудит-логи.**

| `practitioner_id` | UUID NOT NULL (FK → PractitionerProfile.id) | Врач |
| `title` | String NOT NULL | Название программы |
| `description` | Text (nullable) | Описание |
| `status` | String DEFAULT `active` | `active`, `completed`, `archived` |
| `created_at` / `updated_at` | DateTime DEFAULT NOW() | Метки времени |

#### `ExerciseAssignment`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `care_plan_id` | UUID NOT NULL (FK → CarePlan.id) | План ухода |
| `exercise_type` | String NOT NULL | Тип упражнения |
| `payload` | JSONB (nullable) | Параметры упражнения |
| `scheduled_for` | Date (nullable) | Плановая дата |
| `due_at` | DateTime (nullable) | Срок выполнения |

## 8. Порядок реализации (TASKS.md)

### Общие правила

1. Каждый шаг заканчивается зелёными тестами и мержем в `main`.
2. Ни один шаг не начинается, пока не закрыт предыдущий.
3. Схема БД меняется только через Alembic-миграцию; миграция — в том же PR, что и код.
4. Фронтенд (`frontend_dev`) подключается к API по этапам 8–11 через мок-слой.

### Этап 0. Фундамент проекта ✅ Completed

Инициализация репозитория, структура пакетов `app/{core,api,db,models,schemas,services,repositories,workers}`, конфигурация через `pydantic-settings`, подключение к PostgreSQL (asyncpg + SQLAlchemy 2.0), Alembic, каркас приложения (`main.py`, health-check, middleware ошибок, request-id, логирование, CORS, лимит тела запроса), конверт ответа `{data, meta, error}`, docker-compose, CI.

**Готово когда:** `GET /health` отвечает 200, `alembic upgrade head` создаёт схему, пустой `pytest` проходит, CI зелёный.

### Этап 1. Аутентификация и RBAC ✅ Completed

Модели `User`, `Clinic`, `PatientProfile`, `PractitionerProfile`, `RefreshToken`; Argon2id; JWT кодирование/декодирование; сервис аутентификации (регистрация, логин, refresh с rotation, logout, отзыв всех токенов); хеш refresh-токена (SHA-256); зависимости `get_current_user`, `require_roles`, `require_permission`; матрица прав в `core/permissions.py`; rate limit входа; сервис аудита; роутеры `/auth/register|login|refresh|logout`, `/auth/me`, `/auth/change-password`. Тесты: password hashing, JWT, RBAC matrix, auth API, token rotation, rate limit.

**Готово когда:** вход/refresh/logout работают, отзыв токенов работает, RBAC закрывает все эндпоинты, тесты покрывают ≥ 90 % модуля `auth`.

### Этап 2. Клиника, пациенты, специалисты ✅ Completed

CRUD пациентов и специалистов, привязка к клинике; согласия (152-ФЗ); список пациентов с фильтрами; карточка пациента; admin-service (список сотрудников, смена роли). Тесты: patient repo, patients API, admin API, ownership isolation.

### Этап 3. Скрининги (PHQ-9 / GAD-7) ✅ Completed

Версионированные шаблоны опросников; приём ответов; серверный подсчёт балла; интерпретация; флаг критического результата; история прохождений. Тесты: screening scoring, boundaries, screening API, screening repo.

### Этап 4. Дневник самооценки ✅ Completed (new scales)

CRUD записей дневника; bulk-sync с дедупликацией по `(device_id, recorded_at, patient_id)`; CHECK-ограничения шкал; summary. Новые шкалы: mood -3..+3, anxiety 0..4, energy 0..4, functioning 0..4.

### Этап 5. Программы и упражнения ✅ Completed

Реализованы care plans и exercise assignments/completions/compliance:

- `GET/POST /api/v1/care-plans`
- `GET/POST/PUT /api/v1/exercises`, `POST /api/v1/exercises/{id}/complete`, `GET /api/v1/exercises/{id}/compliance`
- Автосоздание default care plan при назначении упражнения без `care_plan_id`
- RBAC: `exercise:assign`, `exercise:complete`; compliance = basic count of completions.

### Этап 6. Алерты и план безопасности ✅ Completed

Создание алерта по правилам скрининга; приоритеты; жизненный цикл алерта (new → in_progress → resolved/dismissed); план безопасности; кризисные сигналы.

### Этап 7. Лекарства и рецепты ✅ Completed

Справочник препаратов `rx.medications`; назначения `rx.prescriptions`; отметки приёма `rx.medication_adherence`; сокращённый контур пациента / полный контур врача.

### Этап 8. Уведомления и сообщения (Partial)

Push-уведомления (planned); чат между пациентом и врачом реализован: `GET/POST /api/v1/messages`, `PATCH /api/v1/messages/{id}/read` (миграция 0016), metadata редактирования сообщений (миграция 0019).

### Этап 9. Аналитика и отчёты (Partial)

Реализованы JSON-агрегаты: `GET /api/v1/reports/clinic`, `GET /api/v1/reports/patient/{id}`. PDF-отчёт перед визитом и выгрузка аналитики клиники — planned.

### Этап 10. Администрирование и безопасность (Completed)

Аудит-логи (API) реализованы: `GET /api/v1/audit`; управление сотрудниками: `GET /api/v1/admin/staff`, `PATCH /api/v1/admin/staff/{id}/role`; настройки клиники: `GET/PUT /api/v1/clinics/{clinic_id}/settings`. Push/SLA и полный audit coverage — planned.

### Этап 11. Расписание врачей и доступность чата (Partial — availability calc реализован; WebSocket presence pending)

Реализовано (миграция 0018): `ClinicSettings`, `PractitionerSchedule`, `PractitionerScheduleException`; endpoints:
- `GET/PUT /api/v1/clinics/{clinic_id}/settings`
- `GET/PUT /api/v1/practitioners/{id}/schedule`
- `POST/DELETE /api/v1/practitioners/{id}/schedule/exceptions/{exception_id}`
- `GET /api/v1/practitioners/{id}/availability`
RBAC: `schedule:read/write`, `clinic_settings:read/write`. Расчёт `is_available_now/next_available_at` реализован. Endpoint SLA доступности для чата `/api/v1/messages/sla/{practitioner_id}` реализован; полный audit logging — planned.

### Этап 12. Базовая строгость данных (Completed)

Реализовано (миграции 0019, 0020): `updated_at` для `messages`, `crisis_signals`, `diary_entries`; metadata редактирования сообщений (`edited_at`, `edited_by`, `is_edited`). Приоритет/статус crisis signals и audit old/new уже присутствуют. Полное покрытие updated_at для всех таблиц — future work.

### Этап 13. Корректировки клинических данных (Partial)

Реализовано: `updated_at` для diary_entries (миграция 0020); correction endpoint PATCH /api/v1/adherence/{id} с audit logging; adherence correction metadata (миграция 0021). Patient assignment lifecycle (create/list/deactivate, audit events) реализован.## Этап 14. Строгая клиническая история (Partial)

Реализовано: таблицы `practitioner_name_history` (0022) и `patient_name_history` (0023) для истории смены ФИО; метаданные корректировки для `diary_entries` (0024); таблица `diary_entry_versions` (0025) для versioning/addendum; soft delete для `messages` (0026, retention policy); аудит-события безопасности (0027, `audit_events`); RLS-подготовка для `patient_profiles` (0028); multi-clinic membership для practitioners (0029, `practitioner_clinic_memberships`); clinic isolation усилен для alert/patient/summary/screening путей и patient/service queries; негативные cross-clinic тесты добавлены. Остальное (полный RLS rollout для остальных PHI-таблиц, wiring `AuditService` в denial/access paths) выполнено: RLS расширен до всех patient-linked PHI-таблиц (миграция `0031_rls_remaining_phi`); AuditService wired в `get_current_user` (success-path `clinic_isolation.allowed`); multi-clinic rollout для exercise/medication/message/report/schedule (Phase 44). Diary CRUD-тесты реализованы (`tests/api/test_diary_crud.py`). Следующий этап (Phase 52): универсальное versioning/addendum для клинических сущностей + retention policy (миграция 0032 `entity_versions`/`trend_snapshots` пока без API).

Отдельная история ФИО, versioning/addendum, retention policy.

Подробности и полный набор правил: раздел `### Data Integrity and Correction Policy — Future Phases (Planned)`.


### Этап 15. Подключение фронтенда и выпуск (Planned)

Замена mock-данных на реальные API-вызовы; docker-compose развёртывание.

### Порядок по критичности

| Приоритет | Этапы | Обоснование |
|-----------|-------|-------------|
| P0 — блокирует всё | 0, 1 | Без аутентификации и каркаса ничего не работает |
| P0 — клинический минимум | 3, 6 | Скрининги и алерты — ядро ценности продукта |
| P1 — сопровождение пациента | 4, 5, 7 | Дневник, упражнения, лекарства |
| P1 — вовлечение | 8 | Уведомления и сообщения удерживают пациента |
| P2 — для клиники | 9, 10 | Аналитика, аудит, ИБ-контур |
| P2 — интеграция | 11, 12 | Подключение фронтенда и выпуск |

### Clinical Architecture Update — Phase 11.0+ (2026-10-23)

- **Diagnosis Layer** (Phase 13/14): `PatientDiagnosis` реализован (ICD10/ICD11, partial unique index, API, RBAC, clinic isolation, audit logging). `DiagnosisReference` справочник МКБ-10/МКБ-11 (миграция 0007). Deprecated alias `/api/v1/icd10`.
- **MBC Layer** (Phase 15): `AssessmentPlan` реализован (миграция 0008, CRUD, RBAC, clinic isolation, patient existence validation, audit logging). `SymptomTrend` как вычисляемый endpoint без отдельной таблицы.
- **Diary Rework** (Phase 11): новые шкалы mood -3..+3, anxiety 0..4, energy 0..4, functioning 0..4; `functioning_score` добавлен; micro-diary (частичные записи, nullable поля).
- **Safety Plan Architecture**: переиспользуемый клинический контент → `SafetyPlanTemplate` / `ClinicalContentLibrary` (планируется).
- **Screening Expansion**: реестр вопросников содержит 8 кодов (PHQ-9, GAD-7, YMRS, HCL-8, HCL-33, PDSS, C-SSRS, ISI); HCL-33 использует 33 пункта и band-пороги 0-7 низкий, 8-13 умеренный, >=14 высокий.

#### `ExerciseCompletion`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `assignment_id` | UUID NOT NULL (FK → ExerciseAssignment.id) | Назначение |
| `patient_id` | UUID NOT NULL (FK → PatientProfile.id) | Пациент |
| `result` | JSONB (nullable) | Результат |
| `completed` | Boolean DEFAULT TRUE | Выполнено |
| `created_at` | DateTime DEFAULT NOW() | Дата выполнения |

**Invite-код:** алфавит `23456789ABCDEFGHJKLMNPQRSTUVWXYZ`, формат UI `RAV-27400` (дефис — маска, на бэкенд без дефиса), TTL задаёт врач.

### Data Integrity and Correction Policy — Future Phases (Planned)

Следующие правила зафиксированы как архитектурные улучшения для будущих фаз. Они не меняют текущий контракт и будут реализованы поэтапно после завершения оставшихся сервисов.

- **Классификация сущностей:**
  - `mutable` — изменяемые конфигурационные/профильные сущности;
  - `append-only` — события и журналы;
  - `correction-aware` — клинически значимые записи, где допустимы исправления, но без молчаливой перезаписи.

- **Политика timestamps:**
  - `mutable` → `TimestampMixin` (`created_at`, `updated_at`);
  - `append-only` → только `created_at`;
  - `correction-aware` → `created_at`, `updated_at`, `corrected_at`, `corrected_by`, `correction_reason`.

- **Клинически строгие исправления:**
  - клинически значимые записи не перезаписываются молча;
  - исправления фиксируются через correction/addendum/versioning;
  - audit log хранит old/new values для критичных полей;
  - секреты, токены, коды и персональные данные не пишутся в audit log.

- **История ФИО:**
  - для `PractitionerProfile` (и при необходимости `PatientProfile`) хранить историю смены ФИО;
  - минимальный вариант: audit log с old/new values;
  - строгий вариант: отдельная таблица истории с `changed_by`, `changed_at`, `reason`, `effective_from`, `effective_to`.

- **`CrisisSignal`:**
  - приоритеты: `critical`, `high`, `medium`, `low`;
  - статусы: `new`, `acknowledged`, `in_progress`, `resolved`, `false_alarm`, `escalated`;
  - хранить `created_at`, `updated_at`, `acknowledged_at`, `resolved_at`, `escalated_at` и ответственных пользователей;
  - приоритет и статус могут меняться после создания сигнала.

- **`PatientAssignment`:**
  - при смене врача старое назначение закрывается с причиной (`end_reason`) и датой окончания;
  - создаётся новое назначение;
  - история назначений сохраняется для аудита и аналитики.

- **`DiaryEntry`:**
  - разрешено редактирование недавних записей с `updated_at` и флагом `is_edited`;
  - строгий режим: correction/addendum с ссылкой на исходную запись и причиной исправления.

- **`MedicationAdherence`:**
  - допускается корректировка отметки приёма;
  - хранить `updated_at`, `corrected_at`, `corrected_by`, `correction_reason`;
  - изменение логируется в audit log.

- **`Message`:**
  - базовая модель остаётся append-only;
  - при поддержке редактирования/удаления добавить `is_edited`, `edited_at`, `deleted_at`, `is_deleted`, `edit_count`;
  - исходное время отправки (`created_at`) не изменяется.

- **`PractitionerSchedule` / `PractitionerScheduleException`:**
  - обе сущности mutable;
  - использовать `created_at / updated_at`;
  - изменения расписания логировать в audit log.

- **Soft delete и retention:**
  - soft delete (`deleted_at`) допускается для сообщений и вспомогательных сущностей;
  - для клинически значимых данных политика хранения и удаления должна быть определена отдельно перед реализацией.

- **Порядок реализации:**
  1. Минимальная строгость: `updated_at`, priority/status для crisis signals, metadata редактирования сообщений, audit log с old/new values.
  2. Корректировки: diary entries, medication adherence, patient assignment lifecycle.
  3. Строгая клиническая история: отдельная история ФИО, versioning/addendum, retention policy.

## Questionnaire anchors

См. [questionnaire_sources](./questionnaire_sources.md) (раздел «Формулировки ответов»): PDSS/ISI имеют item-specific `anchors`; YMRS остаётся clinician-rated с числовыми метками.

## Phase 32 Update
Clinic isolation enforcement added to assignment, message and medication services via shared helper module.

## Phase 33 Update
Clinic isolation enforcement added to exercise service (create/update/compliance) and exercise router now passes current_user into service calls. Tests: 107 passed (Phase 44: exercise translated to multi-clinic `practitioner_clinic_ids()`).

Runtime verification: Docker backend rebuilt and restarted; `/health` returns 200; runtime OpenAPI has 76 paths and 51 schemas, matching committed `docs/openapi.json`. Database migration head: `0032_versions_trends`.

## Phase 39-41 Update
Added `audit_events` table/model and `record_security_event`; RLS preparation for `patient_profiles`; `practitioner_clinic_memberships` table/model; clinic-isolation helpers now support primary + membership clinic ids; `enforce_clinic_match()` accepts list of allowed clinics; membership-aware filtering applied to patient/service queries; negative cross-clinic tests added (`tests/test_cross_clinic_isolation.py`).
Phase 42 update: RLS context wiring in `get_current_user` via `set_config('app.current_clinic_id', ..., true)` for single-clinic users; migration `0030_rls_settings_memberships` extends RLS to `clinic_settings` and `practitioner_clinic_memberships`; cross-clinic isolation added to diary list/summary; cross-clinic tests extended (patient summary, diary list/summary). Tests: 107 passed. Migration head: `0032_versions_trends`. OpenAPI: 76 paths.

Phase 43 update: RLS extended to remaining patient-linked PHI tables (`screening_results`, `diary_entries`, `care_plans`, `exercise_completions`, `alerts`, `prescriptions`, `safety_plans`, `crisis_signals`, `patient_assignments`, `assessment_plans`, `appointments`, `patient_name_history`, `messages`) via migration `0031_rls_remaining_phi`; migration verified upgrade → downgrade → upgrade. Tests: 107 passed. Migration head: `0032_versions_trends`. OpenAPI: 76 paths.

## Phase 44 Update (2026-10-25)
Translated `exercise_service`, `medication_service`, `message_service`, `report_service`, `schedule_service` to multi-clinic membership logic using `practitioner_clinic_ids()` (primary + membership clinic ids). `enforce_clinic_match()` now receives a list of allowed clinic ids (`IN (...)` semantics). `report_service.clinic_analytics` filters aggregates by practitioner's clinic list instead of a single clinic. Success-path audit event `clinic_isolation.allowed` wired in `get_current_user` (`app/api/dependencies.py`). Tests: 107 passed. Migration head: `0032_versions_trends`. OpenAPI: 76 paths (API contracts unchanged).

## Phase 45 Update (2026-10-25)
Universal entity versioning: new `entity_versions` table (migration `0032_versions_trends`) + `EntityVersion` model for versioning/addendum of any clinical entity (medications, care plans, screenings, ...). Trend storage: new `trend_snapshots` table + `TrendSnapshot` model for materialized time-series aggregates (patient/questionnaire/period/window). C-SSRS severity bands refined (added "умеренный" 3-4; max_score=6 confirmed for 6 binary questions). Availability calculation already implemented (`GET /api/v1/practitioners/{id}/availability`); Этап 11 remaining = WebSocket presence only. Migration verified upgrade → downgrade → upgrade. Tests: 107 passed. Migration head: `0032_versions_trends`. OpenAPI: 76 paths (API contracts unchanged).
## Future: Real-time Presence & Chat (WebSocket) — Planned

### Goal
Provide real-time messaging, delivery acknowledgements, read receipts, and practitioner presence/availability for chat SLA indicators.

### Transport
- Protocol: WebSocket (WSS in production).
- Endpoint (planned): /ws/v1/chat or /ws/v1/presence.
- Auth: short-lived access token in query/header or first auth message; validate on connect and on token refresh.
- Heartbeat: server ping / client pong every 20-30s; disconnect stale sockets after 2 missed heartbeats.

### Presence Model
- States: online, away, offline, busy.
- last_seen_at updated on connect, message activity, and graceful disconnect.
- Availability combines schedule availability, presence state, manual override / do-not-disturb.
- Presence stored in Redis with TTL; DB stores only last_seen summary for audit/analytics.

### Message Delivery
- Client sends message.send with idempotency_key.
- Server persists message, returns message.accepted with server id.
- Server pushes message.new to recipient channel.
- Recipient sends message.read -> server updates read state and pushes message.read_receipt.
- Offline recipients: messages remain in DB and are delivered on next connect (inbox sync by since cursor).

### Scaling
- Single instance: in-memory connection registry.
- Multi-instance: Redis Pub/Sub or message broker for fan-out.
- Sticky sessions or broker-based routing; avoid relying on local memory in production.
- Rate limiting per user/socket and per IP.

### Reliability
- Reconnect with exponential backoff + jitter.
- Resume using last_event_id / cursor.
- Idempotent message creation prevents duplicates on retry.
- Graceful shutdown drains sockets and notifies clients.

### Security
- Validate permissions per action (message:read, message:write).
- Clinic isolation enforced on every message/presence event.
- No secrets in query strings in production; prefer header or first-message auth.
- Audit log for connection lifecycle and sensitive actions.

### Migration Strategy
1. Add presence HTTP endpoint and Redis-backed presence store.
2. Add WebSocket endpoint for presence only.
3. Add WebSocket message delivery while keeping REST endpoints.
4. Gradually move clients to WebSocket; keep REST fallback.
5. Add tests for connect/auth/heartbeat/reconnect/delivery/read receipts.
## Phase 47 Update (2026-10-25) — Patient search

- `GET /api/v1/patients` now accepts optional `search` (alias `q`) query parameter for filtering by first name, last name, or email (case-insensitive `ILIKE`).
- Applied across patient/doctor/coordinator RBAC branches in `PatientRepository.get_patients_by_user`.
- OpenAPI updated (`docs/openapi.json`): `search` and `q` query params on `/api/v1/patients`.
- Tests: 137 passed (existing suite).

## Phase 48 Update (2026-10-25) — Aggregated patient home endpoint

- Added `GET /api/v1/patients/{id}/home` aggregating patient card, active alerts count, latest diary entry, and next scheduled appointment.
- OpenAPI updated: 79 paths.
- Tests: 137 passed.


## Phase 49 Update (2026-10-25) — Consent persistence and user profile endpoints

- Added POST /api/v1/auth/consent: requires consent_personal_data and consent_medical_data; optional consent_data_sharing_with_doctor; writes consent_data_processing_at; audit logged.
- Added GET /api/v1/users/{id} and PATCH /api/v1/users/{id}: self/admin access; updates User plus PatientProfile/PractitionerProfile fields.
- Users router registered under /api/v1/users.
- OpenAPI updated: 79 paths.
- Tests: 137 passed.

## Phase 50 Update (2026-10-25) — Home dashboard endpoint
- Added GET /api/v1/home/dashboard aggregating role-aware home data.
- Patient: current patient profile + patient home aggregate (alerts, latest diary, next appointment).
- Doctor/psychologist: practitioner profile, patient/alert/appointment stats, active alert items, today appointments, recent patients.
- Router registration: app/api/v1/home.py included under /api/v1/home.
- OpenAPI updated: 80 paths.
- Tests: 140 passed.

## Phase 53 Update (2026-10-26) — Full updated_at coverage

- Added `updated_at` to mutable entities: `patient_assignments`, `alerts`, `practitioner_profiles`, `practitioner_schedules`, `practitioner_schedule_exceptions` (migration 0033).
- Migration verified: upgrade → downgrade → upgrade.
- Tests: 150 passed.

## Phase 52 Update (2026-10-26) — Entity versioning / addendum + retention

- Added `GET/POST /api/v1/versions` for universal entity version snapshots (`entity_versions`, migration 0032).
- `POST /api/v1/versions` records a version snapshot with optional `is_addendum` flag and reason.
- Diary `PATCH /api/v1/diary/{id}` now records a pre-mutation snapshot into `entity_versions`.
- OpenAPI updated: 85 paths.
- Tests: 148 passed.

## Phase 51 Update (2026-10-25) — Patient home today_tasks aggregate

- Extended GET /api/v1/patients/{id}/home and GET /api/v1/home/dashboard (patient) with today_tasks[].
- today_tasks includes check-in status, active medication tasks, and today appointment task.
- OpenAPI updated: 80 paths.
- Tests: 140 passed.
## Phase 54 Update (2026-10-26) — Versioning snapshots for medications, prescriptions, safety plans, diagnoses

- Medication `PUT /api/v1/medications/{id}` now records a pre-mutation snapshot into `entity_versions` (entity_type=`medication`).
- Prescription `PUT /api/v1/prescriptions/{id}` now records a pre-mutation snapshot into `entity_versions` (entity_type=`prescription`).
- Safety plan `PUT /api/v1/safety/plans/{id}` now records a pre-mutation snapshot into `entity_versions` (entity_type=`safety_plan`).
- Diagnosis `PUT /api/v1/diagnoses/{id}` and `PUT /api/v1/diagnoses/icd10/{id}` now record a pre-mutation snapshot into `entity_versions` (entity_type=`diagnosis`).
- Added `MedicationService.get_prescription()` helper.
- OpenAPI unchanged (85 paths); tests: 150 passed.
