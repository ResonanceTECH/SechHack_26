# Схема базы данных — бэкенд «Клинический компас»

**Источник:** `Архитектурный_дизайн_моделей.md` §7, `DOMAIN_MODEL.md`  
**СУБД:** PostgreSQL 15+  
**Одна БД:** PostgreSQL; параметры подключения задаются через environment variables (см. `.env.example`)  
**Логическое разделение:** concept01 (общий) / concept02 (рецептурный) — без split на уровне БД

## 1. DDL concept01 (общий контур)

```sql
-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Логическое разделение
CREATE SCHEMA IF NOT EXISTS public;        -- concept01: общий контур
CREATE SCHEMA IF NOT EXISTS rx;            -- concept02: рецептурный контур

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(30) UNIQUE,
    phone_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient','doctor','psychologist','coordinator','clinic_admin','super_admin')),
    is_active BOOLEAN DEFAULT TRUE,
    token_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    inn VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(30) CHECK (gender IN ('male','female','other','prefer_not_to_say')),
    phone VARCHAR(30),
    consent_personal_data BOOLEAN NOT NULL DEFAULT FALSE,
    consent_medical_data BOOLEAN NOT NULL DEFAULT FALSE,
    consent_data_processing_at TIMESTAMPTZ,
    clinic_id UUID REFERENCES clinics(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE practitioner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    specialization VARCHAR(50) NOT NULL CHECK (specialization IN ('psychiatrist','psychotherapist','psychologist','nurse','registrar')),
    license_number VARCHAR(100),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE screening_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    questionnaire_type VARCHAR(20) NOT NULL CHECK (questionnaire_type IN ('phq9','gad7')),
    questionnaire_version VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    answers JSONB,  -- ответы по вопросам {question_id: value}: нужно для правила «PHQ-9 п.9 ≥ 1»
    is_critical BOOLEAN DEFAULT FALSE,
    severity VARCHAR(255),
    critical_reason VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_screening_score_range CHECK (
        (questionnaire_type = 'phq9' AND score <= 27) OR
        (questionnaire_type = 'gad7'  AND score <= 21)
    )
);

CREATE TABLE diary_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
    anxiety_score INTEGER CHECK (anxiety_score BETWEEN 1 AND 5),
    sleep_hours REAL,
    energy_score INTEGER CHECK (energy_score BETWEEN 1 AND 5),
    notes TEXT,
    synced_at TIMESTAMPTZ,
    device_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE care_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES practitioner_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exercise_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_plan_id UUID NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
    exercise_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exercise_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES exercise_assignments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('critical_symptom','adherence','missed_diary','screening_risk','adverse_event')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('mandatory','optional','rx')),
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','resolved','dismissed')),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id)
);

CREATE TABLE patient_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES practitioner_profiles(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (patient_id, practitioner_id, clinic_id)
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES practitioner_profiles(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','no_show')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patient_profiles(id),
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_type VARCHAR(30) NOT NULL CHECK (device_type IN ('ios','android','web')),
    push_token VARCHAR(512),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, device_id)
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    replaced_by_token_id UUID REFERENCES refresh_tokens(id),
    device_info VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Одноразовые SMS-коды подтверждения телефона (4 цифры, TTL 5 минут)
CREATE TABLE sms_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(30) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,          -- SHA-256 от кода, не сам код
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invite-коды привязки пациента к врачу (алфавит: 23456789ABCDEFGHJKLMNPQRSTUVWXYZ)
CREATE TABLE invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL,                -- без дефиса, например RAV27400
    practitioner_id UUID NOT NULL REFERENCES practitioner_profiles(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    expires_at TIMESTAMPTZ NOT NULL,
    is_multi_use BOOLEAN DEFAULT FALSE,       -- FALSE: одноразовый; TRUE: для многих пациентов
    max_uses INTEGER DEFAULT 1,
    uses_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (code)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()

-- ============================================
-- Критические сигналы / SOS (P0)
-- ============================================
CREATE TABLE crisis_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sos_call', 'critical_symptom', 'red_flag')),
    source VARCHAR(50) NOT NULL CHECK (source IN ('mobile_app', 'web_app', 'screening_result', 'practitioner_manual')),
    triggered_by_screening_id UUID REFERENCES screening_results(id),
    message TEXT,
    location JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved', 'false_alarm')),
    priority VARCHAR(20) NOT NULL DEFAULT 'critical' CHECK (priority = 'critical'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(id)
);

CREATE INDEX idx_crisis_signals_patient_id ON crisis_signals(patient_id);
CREATE INDEX idx_crisis_signals_status ON crisis_signals(status);
CREATE INDEX idx_crisis_signals_created_at ON crisis_signals(created_at);

-- ============================================
-- C-SSRS — оценка суицидального риска (P0)
-- ============================================
CREATE TABLE cssrs_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    practitioner_id UUID REFERENCES practitioner_profiles(id),
    assessment_date TIMESTAMPTZ NOT NULL,
    version VARCHAR(50) NOT NULL,
    suicidal_ideation BOOLEAN NOT NULL DEFAULT FALSE,
    suicidal_ideation_with_plan BOOLEAN NOT NULL DEFAULT FALSE,
    suicidal_behavior BOOLEAN NOT NULL DEFAULT FALSE,
    most_severe_ideation VARCHAR(50) NOT NULL CHECK (most_severe_ideation IN ('none', 'wish_to_die', 'suicidal_thoughts', 'suicidal_thoughts_with_plan', 'suicidal_intent')),
    most_severe_behavior VARCHAR(50) NOT NULL CHECK (most_severe_behavior IN ('none', 'non_suicidal_self_injury', 'suicide_attempt', 'interrupted_attempt', 'aborted_attempt', 'preparatory_behavior')),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'imminent')),
    risk_factors JSONB,
    protective_factors JSONB,
    recommendations TEXT,
    safety_plan_id UUID REFERENCES safety_plans(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cssrs_assessments_patient_id ON cssrs_assessments(patient_id);
CREATE INDEX idx_cssrs_assessments_risk_level ON cssrs_assessments(risk_level);
CREATE INDEX idx_cssrs_assessments_assessment_date ON cssrs_assessments(assessment_date);

-- ============================================
-- Safety Plan — план безопасности при кризисе (P0)
-- ============================================
CREATE TABLE safety_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES practitioner_profiles(id),
    title VARCHAR(255) NOT NULL,
    warning_signs TEXT,
    internal_coping_strategies TEXT,
    social_contacts TEXT,
    family_support TEXT,
    professional_contacts TEXT,
    emergency_contacts TEXT,
    safe_environment TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    review_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_safety_plans_patient_id ON safety_plans(patient_id);
CREATE INDEX idx_safety_plans_is_active ON safety_plans(is_active);

-- ============================================
-- PatientDiagnosis — диагнозы пациента (МКБ-10/МКБ-11) (P0)
-- ============================================
CREATE TABLE patient_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    coding_system VARCHAR(10) NOT NULL CHECK (coding_system IN ('ICD10','ICD11')),
    code VARCHAR(30) NOT NULL,
    title VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','remission','resolved','closed')),
    diagnosed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    diagnosed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patient_diagnoses_patient_id ON patient_diagnoses(patient_id);
CREATE INDEX idx_patient_diagnoses_status ON patient_diagnoses(status);
CREATE INDEX idx_patient_diagnoses_code ON patient_diagnoses(code);
CREATE UNIQUE INDEX uq_patient_diagnoses_primary_active ON patient_diagnoses(patient_id) WHERE is_primary = true AND status = 'active';

-- ============================================
-- DiagnosisReference — справочник диагнозов (МКБ-10/МКБ-11) — ПЛАНИРУЕТСЯ
-- ============================================
CREATE TABLE diagnosis_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coding_system VARCHAR(10) NOT NULL CHECK (coding_system IN ('ICD10','ICD11')),
    code VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    chapter VARCHAR(255),
    parent_code VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (coding_system, code)
);

CREATE INDEX idx_diagnosis_references_coding_system ON diagnosis_references(coding_system);
CREATE INDEX idx_diagnosis_references_code ON diagnosis_references(code);

-- ============================================
-- MedicationSkipReason — причина пропуска приёма лекарства (P0)
-- ============================================
CREATE TABLE medication_skip_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    prescription_id UUID NOT NULL REFERENCES rx.prescriptions(id) ON DELETE CASCADE,
    taken_at TIMESTAMPTZ NOT NULL,
    skip_reason VARCHAR(50) NOT NULL CHECK (skip_reason IN ('side_effects', 'forgot', 'ran_out', 'cost', 'pregnancy', 'feeling_better', 'feeling_worse', 'other')),
    skip_reason_text TEXT,
    reported_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medication_skip_reasons_patient_id ON medication_skip_reasons(patient_id);
CREATE INDEX idx_medication_skip_reasons_prescription_id ON medication_skip_reasons(prescription_id);
CREATE INDEX idx_medication_skip_reasons_reported_at ON medication_skip_reasons(reported_at);

```

## 2. DDL concept02 (рецептурный контур, схема `rx`)

```sql
CREATE TABLE rx.medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    international_name VARCHAR(255),
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    manufacturer VARCHAR(255),
    instructions_url VARCHAR(500),
    patient_instruction TEXT,
    contraindications TEXT,
    side_effects TEXT,
    interactions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rx.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patient_profiles(id),
    practitioner_id UUID NOT NULL REFERENCES public.practitioner_profiles(id),
    medication_id UUID NOT NULL REFERENCES rx.medications(id),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rx.medication_adherence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES rx.prescriptions(id) ON DELETE CASCADE,
    taken_at TIMESTAMPTZ NOT NULL,
    is_taken BOOLEAN NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 3. Индексы

| Таблица | Индекс | Тип | Назначение |
|---|---|---|---|
| `users` | `idx_users_phone` | UNIQUE | Поиск по телефону при входе (SMS) |
| `users` | `idx_users_email` | UNIQUE | Поиск по email при входе (пароль) |
| `users` | `idx_users_role` | B-tree | Фильтрация по ролям |
| `clinics` | `idx_clinics_name` | B-tree | Поиск клиники |
| `patient_profiles` | `idx_patient_profiles_clinic_id` | B-tree | Пациенты клиники |
| `patient_profiles` | `idx_patient_profiles_user_id` | B-tree | Профиль по пользователю |
| `practitioner_profiles` | `idx_practitioner_profiles_clinic_id` | B-tree | Специалисты клиники |
| `screening_results` | `idx_screening_results_patient_id` | B-tree | История скринингов |
| `screening_results` | `idx_screening_results_is_critical` | B-tree | Критические результаты |
| `diary_entries` | `idx_diary_entries_patient_id_recorded_at` | B-tree | График динамики |
| `diary_entries` | `idx_diary_entries_synced_at` | B-tree | Офлайн-записи |
| `care_plans` | `idx_care_plans_patient_id` | B-tree | Программы пациента |
| `exercise_assignments` | `idx_exercise_assignments_care_plan_id` | B-tree | Назначения по программе |
| `alerts` | `idx_alerts_patient_id_status` | B-tree | Активные алерты |
| `alerts` | `idx_alerts_priority_created_at` | B-tree | Очередь алертов |
| `patient_assignments` | `idx_patient_assignments_patient_id` | B-tree | Привязки пациента |
| `patient_assignments` | `idx_patient_assignments_practitioner_id` | B-tree | Пациенты специалиста |
| `appointments` | `idx_appointments_patient_id_scheduled_at` | B-tree | Записи пациента |
| `appointments` | `idx_appointments_practitioner_id_scheduled_at` | B-tree | Расписание специалиста |
| `appointments` | `idx_appointments_status` | B-tree | Фильтр по статусу |
| `messages` | `idx_messages_sender_id_recipient_id` | B-tree | Переписка |
| `messages` | `idx_messages_patient_id` | B-tree | История пациента |
| `messages` | `idx_messages_is_read` | B-tree | Непрочитанные |
| `notifications` | `idx_notifications_user_id_is_read` | B-tree | Непрочитанные уведомления |
| `user_devices` | `idx_user_devices_user_id` | B-tree | Устройства пользователя |
| `user_devices` | `idx_user_devices_push_token` | B-tree | Push по токену |
| `refresh_tokens` | `idx_refresh_tokens_user_id` | B-tree | Сессии пользователя |
| `refresh_tokens` | `idx_refresh_tokens_token_hash` | UNIQUE | Быстрый lookup по хешу |
| `sms_codes` | `idx_sms_codes_phone` | B-tree | Поиск активного кода по номеру |
| `invite_codes` | `idx_invite_codes_practitioner_id` | B-tree | Коды специалиста |
| `invite_codes` | `idx_invite_codes_is_active` | B-tree | Активные коды |
| `audit_logs` | `idx_audit_logs_user_id_created_at` | B-tree | Аудит пользователя |
| `audit_logs` | `idx_audit_logs_entity_type_entity_id` | B-tree | История сущности |
| `rx.medications` | `idx_medications_name` | B-tree | Поиск препарата |
| `rx.prescriptions` | `idx_prescriptions_patient_id_is_active` | B-tree | Активные рецепты |
| `rx.medication_adherence` | `idx_adherence_prescription_id_taken_at` | UNIQUE | Одна отметка на приём; история приёма |

```sql
-- Дедупликация офлайн-синхронизации дневника
CREATE UNIQUE INDEX idx_diary_entries_offline_dedup
ON diary_entries (device_id, recorded_at, patient_id)
WHERE device_id IS NOT NULL AND recorded_at IS NOT NULL;

-- Одна отметка приёма на конкретный момент времени
CREATE UNIQUE INDEX idx_adherence_prescription_id_taken_at
ON rx.medication_adherence (prescription_id, taken_at);
```

## 4. CHECK-ограничения (сводно)

| Таблица | Поле | Ограничение |
|---|---|---|
| `screening_results` | `score` | `score >= 0` + `chk_screening_score_range`: PHQ-9 ≤ 27, GAD-7 ≤ 21 |
| `diary_entries` | `mood_score` | `mood_score BETWEEN 1 AND 5` |
| `diary_entries` | `anxiety_score` | `anxiety_score BETWEEN 1 AND 5` |
| `diary_entries` | `energy_score` | `energy_score BETWEEN 1 AND 5` |
| `users` | `role` | `role IN ('patient','doctor','psychologist','coordinator','clinic_admin','super_admin')` |
| `practitioner_profiles` | `specialization` | `specialization IN ('psychiatrist','psychotherapist','psychologist','nurse','registrar')` |
| `alerts` | `type` | `type IN ('critical_symptom','adherence','missed_diary','screening_risk','adverse_event')` |
| `alerts` | `priority` | `priority IN ('mandatory','optional','rx')` |
| `alerts` | `status` | `status IN ('new','in_progress','resolved','dismissed')` |
| `appointments` | `status` | `status IN ('scheduled','completed','cancelled','no_show')` |
| `user_devices` | `device_type` | `device_type IN ('ios','android','web')` |

## 5. NOT NULL ограничения

- `patient_profiles.consent_personal_data` — NOT NULL (согласие на обработку ПД, 152-ФЗ)
- `patient_profiles.consent_medical_data` — NOT NULL (согласие на обработку медданных)
- `users.email` — UNIQUE (обязателен только для email+пароль входа)
- `users.password_hash` — обязателен только для email+пароль входа (для телефон+SMS не требуется)
- `users.token_version` — NOT NULL DEFAULT 1

## 6. Миграции (Alembic)


Новые миграции для P0 сущностей (кризисные сигналы, C-SSRS, Safety Plan, МКБ-10, пропуск приёма):

| Миграция | Описание | Таблицы |
|---|---|---|
| `0004_crisis_safety_entities` | Добавление критических клинических сущностей | `crisis_signals`, `cssrs_assessments`, `safety_plans`, `icd10_codes`, `medication_skip_reasons` |

Создание:
```bash
alembic revision --autogenerate -m "0004_crisis_safety_entities"
alembic upgrade head
```

Все изменения схемы через Alembic. Начальная ревизия — `base` с вышеуказанными таблицами.  
Схема `rx` создаётся первой миграцией (`alembic revision --autogenerate` с `include_schemas=True`).

## 7. Ограничения MVP (что осознанно не делаем)

| Не делаем | Почему | Когда добавим |
|---|---|---|
| Soft-delete (`deleted_at`) | ТЗ не требует; удаление пациентских записей — физическое, с аудитом в `audit_logs` | При появлении правки на удаление медданных |
| Multi-tenant `tenant_id` | MVP — одна клиника; изоляция по `clinic_id` достаточна | При SaaS-мультитенанте |
| Row-Level Security | Управляется на уровне приложения (RBAC), RLS добавим позже | При подключении внешних BI-инструментов |
| Полнотекстовый поиск по дневнику | Не требуется в MVP-экранах | Если добавим поиск по notes |
| Партиционирование `audit_logs`/`diary_entries` | Объёмы MVP не требуют | При >10 млн записей |

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
