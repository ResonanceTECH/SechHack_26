# Доменная модель — сущности и связи

**Источник:** `Архитектурный_дизайн_моделей.md` §2, `ТЗ_Клинический_Компас_v1.0.md` §8.3, `WP/White_Paper.MD` §4.2  
**Первичные ключи:** UUID  
**Временные метки:** UTC ISO-8601  
**Одна БД:** PostgreSQL; логическое разделение concept01 / concept02; параметры подключения задаются через environment variables

## 1. Общий контур (concept01)

### 1.1 `User` — пользователь системы

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `email` | String (unique, nullable) | Уникальный email (для email+пароль входа) |
| `phone` | String (unique, nullable) | Телефон в E.164 (для телефон+SMS входа) |
| `phone_verified` | Boolean | Подтверждён ли телефон SMS-кодом |
| `password_hash` | String (nullable) | argon2 хеш (только для email+пароль аккаунтов) |
| `token_version` | Integer | Версия токена для глобального отзыва refresh-сессий |
| `role` | Enum | `patient`, `doctor`, `psychologist`, `coordinator`, `clinic_admin`, `super_admin` |
| `is_active` | Boolean | Активен ли аккаунт |
| `created_at` | DateTime | Дата создания |
| `updated_at` | DateTime | Дата последнего обновления |
| `last_login_at` | DateTime (nullable) | Дата последнего входа |

### 1.2 `PatientProfile` — профиль пациента

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID (FK → User.id) | Ссылка на пользователя |
| `first_name` | String | Имя |
| `last_name` | String | Фамилия |
| `middle_name` | String (nullable) | Отчество |
| `birth_date` | Date | Дата рождения |
| `gender` | Enum | `male`, `female`, `other`, `prefer_not_to_say` |
| `phone` | String (nullable) | Телефон |
| `consent_personal_data` | Boolean | Согласие на обработку ПД (152-ФЗ) |
| `consent_medical_data` | Boolean | Согласие на обработку медданных |
| `consent_data_processing_at` | DateTime (nullable) | Дата проставления согласий |
| `clinic_id` | UUID (FK → Clinic.id, nullable) | Привязанная клиника |
| `created_at` | DateTime | Дата создания |
| `updated_at` | DateTime | Дата обновления |

### 1.3 `PractitionerProfile` — профиль специалиста

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID (FK → User.id) | Ссылка на пользователя |
| `first_name` | String | Имя |
| `last_name` | String | Фамилия |
| `middle_name` | String (nullable) | Отчество |
| `specialization` | Enum | `psychiatrist`, `psychotherapist`, `psychologist`, `nurse`, `registrar` |
| `license_number` | String (nullable) | Номер лицензии |
| `clinic_id` | UUID (FK → Clinic.id) | Клиника |
| `is_active` | Boolean | Активен |
| `created_at` | DateTime | Дата создания |

### 1.4 `Clinic` — медицинская организация

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `name` | String | Название клиники |
| `address` | String | Адрес |
| `inn` | String (nullable) | ИНН |
| `is_active` | Boolean | Активна |
| `created_at` | DateTime | Дата создания |

### 1.5 `ScreeningResult` — результат скрининга (PHQ-9 / GAD-7)

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `questionnaire_type` | Enum | `phq9`, `gad7` |
| `questionnaire_version` | String | Версия опросника |
| `score` | Integer (CHECK: >= 0, см. верхние границы ниже) | Суммарный балл |
| `answers` | JSONB (nullable) | Ответы по вопросам `{question_id: value, …}` — нужны для проверки правила «PHQ-9 п.9 ≥ 1»; серверный подсчёт, клиентский score игнорируется |
| `is_critical` | Boolean | Критический результат (алертинг) |
| `severity` | String (nullable, max 255) | Нейтральный короткий лейбл тяжести (`минимальная`, `лёгкая`, `умеренная`, `умеренно выраженная`, `тяжёлая`) |
| `critical_reason` | String (nullable, max 200) | Причина критичности (`high_total_score`, `suicidal_ideation_item` или комбинация) |
| `created_at` | DateTime | Дата прохождения |

### 1.6 `DiaryEntry` — запись дневника

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `recorded_at` | DateTime | Время записи (UTC) |
| `mood_score` | Integer (CHECK: 1–5) | Настроение |
| `anxiety_score` | Integer (CHECK: 1–5) | Тревога |
| `sleep_hours` | Float (nullable) | Часы сна |
| `energy_score` | Integer (CHECK: 1–5) | Энергия |
| `notes` | Text (nullable) | Заметки |
| `synced_at` | DateTime (nullable) | Флаг офлайн-синхронизации |
| `device_id` | String (nullable) | Идентификатор устройства (для офлайн-синхронизации) |
| `created_at` | DateTime | Дата создания |

### 1.7 `CarePlan` — программа сопровождения

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `practitioner_id` | UUID (FK → PractitionerProfile.id) | Специалист |
| `title` | String | Название программы |
| `description` | Text | Описание |
| `start_date` | Date | Дата начала |
| `end_date` | Date (nullable) | Дата окончания |
| `is_active` | Boolean | Активна |
| `created_at` | DateTime | Дата создания |

### 1.8 `ExerciseAssignment` — назначение упражнения

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `care_plan_id` | UUID (FK → CarePlan.id) | Программа |
| `exercise_type` | String | Тип упражнения (поведенческая активация, дневник мыслей и т.д.) |
| `title` | String | Название |
| `description` | Text | Описание |
| `due_date` | Date (nullable) | Срок выполнения |
| `created_at` | DateTime | Дата создания |

### 1.9 `ExerciseCompletion` — выполнение упражнения

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `assignment_id` | UUID (FK → ExerciseAssignment.id) | Назначение |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `completed_at` | DateTime | Дата выполнения |
| `comment` | Text (nullable) | Комментарий пациента |
| `created_at` | DateTime | Дата создания |

### 1.10 `Alert` — алерт

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `type` | Enum | `critical_symptom`, `adherence`, `missed_diary`, `screening_risk`, `adverse_event` |
| `priority` | Enum | `mandatory`, `optional`, `rx` |
| `status` | Enum | `new`, `in_progress`, `resolved`, `dismissed` |
| `title` | String | Заголовок |
| `summary` | Text | Краткое описание |
| `created_at` | DateTime | Дата создания |
| `resolved_at` | DateTime (nullable) | Дата закрытия |
| `resolved_by` | UUID (FK → User.id, nullable) | Кто закрыл |

### 1.11 `AuditLog` — журнал аудита

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID (FK → User.id) | Кто выполнил действие |
| `action` | String | Тип действия |
| `entity_type` | String | Тип сущности |
| `entity_id` | UUID | ID сущности |
| `old_values` | JSONB (nullable) | Старые значения |
| `new_values` | JSONB (nullable) | Новые значения |
| `created_at` | DateTime | Дата события |

### 1.12 `PatientAssignment` — привязка пациента к врачу

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `practitioner_id` | UUID (FK → PractitionerProfile.id) | Врач |
| `clinic_id` | UUID (FK → Clinic.id) | Клиника |
| `is_active` | Boolean | Активна ли привязка |
| `assigned_at` | DateTime | Дата привязки (invite-код / QR) |

UNIQUE (`patient_id`, `practitioner_id`, `clinic_id`).

### 1.13 `Appointment` — запись на приём

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `practitioner_id` | UUID (FK → PractitionerProfile.id) | Врач |
| `clinic_id` | UUID (FK → Clinic.id) | Клиника |
| `scheduled_at` | DateTime | Плановое время приёма |
| `status` | Enum | `scheduled`, `completed`, `cancelled`, `no_show` |
| `reason` | Text (nullable) | Причина / комментарий |
| `created_at` | DateTime | Дата создания |
| `updated_at` | DateTime | Дата обновления |

### 1.14 `Message` — сообщение врач ↔ пациент

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `sender_id` | UUID (FK → User.id) | Отправитель |
| `recipient_id` | UUID (FK → User.id) | Получатель |
| `patient_id` | UUID (FK → PatientProfile.id, nullable) | Пациент (контекст переписки) |
| `body` | Text | Текст сообщения |
| `is_read` | Boolean | Прочитано ли |
| `created_at` | DateTime | Дата отправки |
| `read_at` | DateTime (nullable) | Дата прочтения |

### 1.15 `Notification` — уведомление

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID (FK → User.id) | Получатель |
| `type` | String | Тип (`push`, `alert`, `message`, `appointment` и др.) |
| `title` | String (nullable) | Заголовок |
| `body` | Text (nullable) | Текст |
| `data` | JSONB (nullable) | Доп. данные (deep-link и т.п.) |
| `is_read` | Boolean | Прочитано ли |
| `created_at` | DateTime | Дата создания |

### 1.16 `UserDevice` — устройство пользователя (push-токен)

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID (FK → User.id) | Пользователь |
| `device_id` | String | Идентификатор устройства |
| `device_type` | Enum | `ios`, `android`, `web` |
| `push_token` | String (nullable) | FCM/APNs токен |
| `last_seen_at` | DateTime (nullable) | Последняя активность |
| `created_at` | DateTime | Дата регистрации |

UNIQUE (`user_id`, `device_id`).

### 1.17 `RefreshToken` — серверная сессия (refresh-токен)

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID (FK → User.id) | Пользователь |
| `token_hash` | String | SHA-256 от refresh-токена (не сам токен) |
| `expires_at` | DateTime | Срок жизни |
| `revoked_at` | DateTime (nullable) | Дата отзыва (rotation) |
| `replaced_by_token_id` | UUID (FK → RefreshToken.id, nullable) | Новый токен после rotation |
| `device_info` | String (nullable) | Device info |
| `created_at` | DateTime | Дата создания |

### 1.18 `SmsCode` — одноразовый SMS-код (4 цифры, TTL 5 минут)

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `phone` | String | Телефон (E.164) |
| `code_hash` | String | SHA-256 от кода (не сам код) |
| `expires_at` | DateTime | Срок действия |
| `is_used` | Boolean | Использован ли |
| `attempts` | Integer | Число попыток ввода |
| `created_at` | DateTime | Дата создания |

### 1.19 `InviteCode` — invite-код привязки к врачу

Алфавит: `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (32 символа: исключены только визуально неоднозначные 0/1/I/O — контракт с командой). Формат UI: `RAV-27400`; на бэкенд — без дефиса (`RAV27400`).

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `code` | String (unique) | Код без дефиса |
| `practitioner_id` | UUID (FK → PractitionerProfile.id) | Врач-создатель |
| `clinic_id` | UUID (FK → Clinic.id) | Клиника |
| `expires_at` | DateTime | Срок действия (задаёт врач) |
| `is_multi_use` | Boolean | Многоразовый ли код |
| `max_uses` | Integer | Максимум использований |
| `uses_count` | Integer | Текущее число использований |
| `is_active` | Boolean | Активен ли |
| `created_at` | DateTime | Дата создания |


### 1.20 `CrisisSignal` — критический сигнал (SOS / вызов экстренной помощи)

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `type` | Enum | `sos_call`, `critical_symptom`, `red_flag` |
| `source` | Enum | `mobile_app`, `web_app`, `screening_result`, `practitioner_manual` |
| `triggered_by_screening_id` | UUID (FK → ScreeningResult.id, nullable) | Скрининг, ставший триггером |
| `message` | Text (nullable) | Сообщение пациента при сигнале |
| `location` | JSONB (nullable) | Координаты/местоположение (из мобилки) |
| `status` | Enum | `new`, `acknowledged`, `resolved`, `false_alarm` |
| `priority` | Enum | `critical` — всегда максимальный |
| `created_at` | DateTime | Время сигнала |
| `acknowledged_at` | DateTime (nullable) | Время подтверждения врачом |
| `acknowledged_by` | UUID (FK → User.id, nullable) | Кто подтвердил |

### 1.21 `CssrsAssessment` — оценка суицидального риска (C-SSRS)

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `practitioner_id` | UUID (FK → PractitionerProfile.id, nullable) | Врач (если проведено на приёме) |
| `assessment_date` | DateTime | Дата проведения оценки |
| `version` | String | Версия опросника C-SSRS |
| `suicidal_ideation` | Boolean | Наличие суицидальных мыслей |
| `suicidal_ideation_with_plan` | Boolean | Мысли с планом |
| `suicidal_behavior` | Boolean | Суицидальное поведение (попытка, подготовка) |
| `most_severe_ideation` | Enum | `none`, `wish_to_die`, `suicidal_thoughts`, `suicidal_thoughts_with_plan`, `suicidal_intent` |
| `most_severe_behavior` | Enum | `none`, `non_suicidal_self_injury`, `suicide_attempt`, `interrupted_attempt`, `aborted_attempt`, `preparatory_behavior` |
| `risk_level` | Enum | `low`, `moderate`, `high`, `imminent` |
| `risk_factors` | JSONB (nullable) | Факторы риска (детализация) |
| `protective_factors` | JSONB (nullable) | Защитные факторы |
| `recommendations` | Text (nullable) | Рекомендации врача |
| `safety_plan_id` | UUID (FK → SafetyPlan.id, nullable) | Связанный план безопасности |
| `created_at` | DateTime | Дата создания |

### 1.22 `SafetyPlan` — план безопасности при кризисе

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `practitioner_id` | UUID (FK → PractitionerProfile.id) | Врач, составивший план |
| `title` | String | Название плана |
| `warning_signs` | Text | Предупреждающие сигналы (распознавание кризиса) |
| `internal_coping_strategies` | Text | Внутренние стратегии совладания |
| `social_contacts` | Text | Социальные контакты для отвлечения |
| `family_support` | Text | Поддержка семьи и близких |
| `professional_contacts` | Text | Профессиональные контакты (врач, кризисная линия) |
| `emergency_contacts` | Text | Экстренные контакты (103/112, ближайшая больница) |
| `safe_environment` | Text | Обеспечение безопасной среды (ограничение доступа к средствам) |
| `is_active` | Boolean | Активен ли план |
| `review_date` | Date (nullable) | Дата пересмотра плана |
| `created_at` | DateTime | Дата создания |
| `updated_at` | DateTime | Дата последнего обновления |

### 1.23 `PatientDiagnosis` — диагноз пациента (МКБ-10/МКБ-11)

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `coding_system` | Enum (`ICD10`, `ICD11`) | Система кодирования |
| `code` | String (30) | Код диагноза (F41.1, 6B00) |
| `title` | String (255, nullable) | Название диагноза |
| `is_primary` | Boolean | Первичный диагноз |
| `status` | Enum (`active`, `remission`, `resolved`, `closed`) | Статус диагноза |
| `diagnosed_at` | DateTime | Дата установки диагноза |
| `ended_at` | DateTime (nullable) | Дата закрытия/ремиссии |
| `diagnosed_by` | UUID (FK → User.id, nullable) | Врач, поставивший диагноз |
| `is_confirmed` | Boolean | Подтверждён ли диагноз |
| `notes` | Text (nullable) | Замечания врача |
| `created_at` | DateTime | Дата создания записи |
| `updated_at` | DateTime | Дата последнего обновления |

Частичный UNIQUE-индекс: один активный первичный диагноз на пациента.

### 1.24 `DiagnosisReference` — справочник диагнозов (МКБ-10/МКБ-11) — ПЛАНИРУЕТСЯ

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `coding_system` | Enum (`ICD10`, `ICD11`) | Система кодирования |
| `code` | String (30) | Код диагноза |
| `title` | String (255) | Название (ru) |
| `title_en` | String (255, nullable) | Название (en) |
| `chapter` | String (255, nullable) | Глава/раздел |
| `parent_code` | String (30, nullable) | Родительский код |
| `is_active` | Boolean | Активен в справочнике |
| `version` | String (50, nullable) | Версия справочника |
| `created_at` | DateTime | Дата создания |

UNIQUE(coding_system, code).

### 1.24 `MedicationSkipReason` — причина пропуска приёма лекарства

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `prescription_id` | UUID (FK → rx.prescriptions.id) | Назначение, которое пропущено |
| `taken_at` | DateTime | Плановое время приёма |
| `skip_reason` | Enum | `side_effects`, `forgot`, `ran_out`, `cost`, `pregnancy`, `feeling_better`, `feeling_worse`, `other` |
| `skip_reason_text` | Text (nullable) | Текст причины (если `other`) |
| `reported_at` | DateTime | Время сообщения о пропуске |
| `created_at` | DateTime | Дата записи |

## 2. Рецептурный контур (concept02) — логически в той же БД

### 2.1 `Medication` — лекарственный препарат

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `name` | String | Торговое название |
| `international_name` | String | МНН |
| `dosage_form` | String | Форма выпуска |
| `strength` | String | Дозировка |
| `manufacturer` | String | Производитель |
| `instructions_url` | String (nullable) | Ссылка на инструкцию (ОХЛП / aviandr.ru) |
| `patient_instruction` | Text (nullable) | Краткая инструкция для пациента (сокращённый контур) |
| `contraindications` | Text (nullable) | Противопоказания |
| `side_effects` | Text (nullable) | Побочные действия |
| `interactions` | Text (nullable) | Взаимодействия |
| `created_at` | DateTime | Дата создания |

### 2.2 `Prescription` — рецепт / назначение препарата

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `patient_id` | UUID (FK → PatientProfile.id) | Пациент |
| `practitioner_id` | UUID (FK → PractitionerProfile.id) | Врач |
| `medication_id` | UUID (FK → Medication.id) | Препарат |
| `dosage` | String | Назначенная дозировка |
| `frequency` | String | Частота приёма |
| `start_date` | Date | Дата начала |
| `end_date` | Date (nullable) | Дата окончания |
| `is_active` | Boolean | Активен |
| `created_at` | DateTime | Дата создания |

### 2.3 `MedicationAdherence` — приверженность приёму

| Поле | Тип | Описание |
|---|---|---|
| `id` | UUID | PK |
| `prescription_id` | UUID (FK → Prescription.id) | Рецепт |
| `taken_at` | DateTime | Время приёма |
| `is_taken` | Boolean | Принят ли препарат |
| `note` | Text (nullable) | Заметка пациента |
| `created_at` | DateTime | Дата записи |

## 3. Связи (ER-кратко)

```
User 1─┐
       ├─1:N PatientProfile
       ├─1:N PractitionerProfile
       ├─1:N RefreshToken
       ├─1:N UserDevice
       ├─1:N Notification
       ├─1:N Message (as sender / recipient)
       └─1:N AuditLog

PatientProfile 1─┐
                 ├─1:N ScreeningResult
                 ├─1:N DiaryEntry
                 ├─1:N CarePlan (как пациент)
                 ├─1:N ExerciseCompletion
                 ├─1:N Prescription
                 ├─1:N MedicationAdherence
                 ├─1:N PatientAssignment
                 ├─1:N Appointment
                 └─1:N Message (patient context)

PractitionerProfile 1─┐
                      ├─1:N CarePlan (как специалист)
                      ├─1:N ExerciseAssignment
                      ├─1:N Prescription
                      ├─1:N PatientAssignment
                      ├─1:N Appointment
                      ├─1:N InviteCode
                      └─1:N Alert (resolved_by)

Clinic 1─N PatientProfile
Clinic 1─N PractitionerProfile
Clinic 1─N PatientAssignment
Clinic 1─N Appointment
Clinic 1─N InviteCode

CarePlan 1─N ExerciseAssignment
ExerciseAssignment 1─N ExerciseCompletion
Prescription 1─N MedicationAdherence
Medication 1─N Prescription
RefreshToken N─1 User (replaced_by → RefreshToken self)
```

## 4. Индексы (кратко)

| Таблица | Индекс | Назначение |
|---|---|---|
| `users` | `idx_users_email` (UNIQUE) | Поиск по email при входе |
| `users` | `idx_users_phone` (UNIQUE) | Поиск по телефону при SMS-входе |
| `users` | `idx_users_role` | Фильтрация по ролям |
| `patient_profiles` | `idx_patient_profiles_clinic_id` | Пациенты клиники |
| `screening_results` | `idx_screening_results_patient_id` | История скринингов |
| `screening_results` | `idx_screening_results_is_critical` | Критические результаты |
| `diary_entries` | `idx_diary_entries_patient_id_recorded_at` | График динамики |
| `diary_entries` | `idx_diary_entries_synced_at` | Офлайн-записи |
| `care_plans` | `idx_care_plans_patient_id` | Программы пациента |
| `exercise_assignments` | `idx_exercise_assignments_care_plan_id` | Назначения по программе |
| `alerts` | `idx_alerts_patient_id_status` | Активные алерты |
| `alerts` | `idx_alerts_priority_created_at` | Очередь алертов |
| `audit_logs` | `idx_audit_logs_user_id_created_at` | Аудит пользователя |
| `audit_logs` | `idx_audit_logs_entity_type_entity_id` | История сущности |
| `rx.medications` | `idx_medications_name` | Поиск препарата |
| `rx.prescriptions` | `idx_prescriptions_patient_id_is_active` | Активные рецепты |
| `rx.medication_adherence` | `idx_adherence_prescription_id_taken_at` | История приёма по рецепту |
| `patient_assignments` | `idx_patient_assignments_patient_id` | Привязки пациента |
| `patient_assignments` | `idx_patient_assignments_practitioner_id` | Пациенты специалиста |
| `appointments` | `idx_appointments_practitioner_id_scheduled_at` | Расписание специалиста |
| `messages` | `idx_messages_sender_id_recipient_id` | Переписка |
| `notifications` | `idx_notifications_user_id_is_read` | Непрочитанные уведомления |
| `user_devices` | `idx_user_devices_user_id` | Устройства пользователя |
| `refresh_tokens` | `idx_refresh_tokens_token_hash` (UNIQUE) | Lookup сессии по хешу |
| `invite_codes` | `idx_invite_codes_practitioner_id` | Коды специалиста |

## 5. Отличия от `Архитектурный_дизайн_моделей.md`

Исходный архитектурный документ не меняем, но в MVP используем уточнённую модель. Отличия:

| Аспект | В исходном документе | В MVP (здесь) | Почему |
|---|---|---|---|
| Поле приоритета алерта | `severity` (`mandatory`/`advisory`) | `priority` (`mandatory`/`optional`/`rx`) | Figma и `mockAlerts.ts` используют три уровня, включая отдельный `rx` для лекарственных алертов; имя `severity` занято в `mockMedications.ts` под взаимодействия (`mandatory`/`preferred`) |
| Тип алерта | `alert_type` (`critical_symptom`, `missed_entries`, `medication_adherence_low`, `screening_deterioration`) | `type` (`critical_symptom`, `adherence`, `missed_diary`, `screening_risk`, `adverse_event`) | Расширено на `adverse_event` (побочное действие, отмеченное пациентом) и разделение причин «пропуск упражнения» и «пропуск препарата» в один тип `adherence` с разным приоритетом |
| Источник алерта | `triggered_by` (`system`/`doctor_manual`) | не вынесено в отдельное поле | В MVP все алерты порождаются системой; ручное создание алерта врачом не предусмотрено |
| Данные триггера | `trigger_data_json` JSONB | не выделено | Триггерные данные доступны через связанную сущность (результат скрининга, запись дневника, отметку приёма) — денормализация не нужна |
| Взаимодействия лекарств | отдельная таблица `medication_interactions` | текстовое поле `rx.medications.interactions` | Автоматическая проверка взаимодействий отложена (см. `MEDICATIONS.md` §6); в Figma взаимодействия показаны как текстовые блоки |
| Электронный рецепт | отдельная сущность | `rx.prescriptions` | Рецепт — это назначение с дозировкой и сроком; генерация ЕГИСЗ вне MVP |

## 7. Ограничения целостности

- `screening_results.score` — CHECK: `score >= 0` + `chk_screening_score_range` (PHQ-9 ≤ 27, GAD-7 ≤ 21)
- `diary_entries.mood_score` — CHECK: `mood_score BETWEEN 1 AND 5`
- `diary_entries.anxiety_score` — CHECK: `anxiety_score BETWEEN 1 AND 5`
- `patient_profiles.consent_personal_data` — NOT NULL
- `patient_profiles.consent_medical_data` — NOT NULL
- Частичный UNIQUE-индекс по (`device_id`, `recorded_at`, `patient_id`) в `diary_entries` (дедупликация офлайн-синхронизации)

---

## Clinical Architecture Update — Phase 11.0 (2026-10-23)

### Diagnosis Layer — Реализовано (Phase 13)

- `PatientDiagnosis` реализован: `coding_system` (ICD10/ICD11), `code`, `title`, `is_primary`, `status` (active/remission/resolved/closed), `diagnosed_at`, `ended_at`, `diagnosed_by`, `is_confirmed`, `notes`, `created_at`, `updated_at`.
- Partial unique index: один активный первичный диагноз на пациента.
- API: `/api/v1/diagnoses` (GET/POST/GET/{id}/PUT/{id}), `/api/v1/patients/{id}/diagnoses`.
- Patient Card summary включает диагнозы.
- RBAC: diagnosis:read / diagnosis:write.
- Планируется: `DiagnosisReference` (справочник МКБ-10/МКБ-11), deprecated alias `/api/v1/icd10`, clinic isolation, audit logging.

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
