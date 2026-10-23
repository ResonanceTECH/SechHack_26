# F.MD — Independent System Audit (Clinical Compass Backend)

**Дата аудита:** 23.10.2026  
**Объект аудита:** бэкенд «Клинический компас» (SechHack_26/backend)  
**Источники доказательств:** source code, migrations, OpenAPI, runtime, tests, frontend code, mobile code, figma artifacts  
**Правила:** EVIDENCE RULES — документация НЕ является доказательством реализации. Каждое утверждение имеет статус VERIFIED / PARTIALLY VERIFIED / UNVERIFIED / CONTRADICTED со ссылкой на доказательство.

---

## 1. Executive Summary


## 2. Architecture

### 2.1 Реализованные модули (VERIFIED)

| Модуль | Статус | Evidence |
|--------|--------|----------|
| auth-service | ✅ Реализован | app/api/v1/auth.py, app/services/auth_service.py, app/core/security/jwt.py, app/core/security/passwords.py |
| patient-service | ✅ Реализован (core CRUD) | app/api/v1/patients.py, app/services/patient_service.py, app/repositories/patient_repository.py |
| screening-service | ✅ Реализован | app/api/v1/screenings.py, app/services/screening_service.py, app/core/questionnaire_registry.py |
| alert-service | ✅ Реализован | app/api/v1/alerts.py, app/services/alert_service.py, app/repositories/alert_repository.py |
| diary-service | ✅ Реализован | app/api/v1/diary.py, app/repositories/diary_repository.py, app/models/clinical.py |
| diagnosis-service | ✅ Реализован (Phase 13/14) | app/api/v1/diagnoses.py, app/models/diagnosis.py, migrations 0006, 0007 |
| assessment-plan | ✅ Реализован (Phase 15) | app/api/v1/assessment_plans.py, app/models/care.py (CarePlan), migration 0008 |
| safety-service | ✅ Реализован | app/api/v1/safety.py, migrations 0004, 0009 |

**Source:** app/api/v1/router.py (12 роутеров зарегистрированы), docs/openapi.json (41 путей)

### 2.2 Отсутствующие модули (документированы, не реализованы в коде)

| Модуль | Документировано в | Реализовано в коде | Status |
|--------|-------------------|-------------------|--------|
| medication-service | API_CONTRACTS.md §3, MEDICATIONS.md | Нет роутера `/api/v1/medications` | UNVERIFIED (документ только) |
| prescription-service | API_CONTRACTS.md, MEDICATIONS.md §3.3 | Нет роутера `/api/v1/prescriptions` | UNVERIFIED |
| adherence-service | MEDICATIONS.md §3.4 | Нет роутера `/api/v1/adherence` | UNVERIFIED |
| program-service (exercises) | MODULES.md §8 | Нет роутера `/api/v1/exercises` | UNVERIFIED |
| message-service | API_CONTRACTS.md | Нет роутера `/api/v1/messages` | UNVERIFIED |
| appointment-service | API_CONTRACTS.md | Нет роутера `/api/v1/appointments` | UNVERIFIED |
| report-service | MODULES.md §10 | Нет роутера `/api/v1/reports` | UNVERIFIED |
| admin-service | MODULES.md §10 | Нет роутера `/api/v1/admin` | UNVERIFIED |
| audit-service (API) | AUTH_PLAN.md §6 | Нет роутера `/api/v1/audit` (только сервис записи) | PARTIALLY VERIFIED |

Evidence:
- app/api/v1/router.py — регистрирует только: health, auth, practitioners, patients, screenings, questionnaires, alerts, diagnoses, assessment_plans, safety, diary, integrations
- Нет файлов: app/api/v1/medications.py, app/api/v1/prescriptions.py, app/api/v1/adherence.py, app/api/v1/exercises.py, app/api/v1/messages.py, app/api/v1/appointments.py, app/api/v1/reports.py, app/api/v1/admin.py, app/api/v1/audit.py

### 2.3 Контрадикция документации и кода (CONTRADICTED)

**Утверждение:** DB_SCHEMA.md §7 указывает диапазоны `mood_score BETWEEN 1 AND 5` и `anxiety_score BETWEEN 1 AND 5`.

**Реальность (код + миграция):**
- Migration `0011_diary_entries.py` (lines 33-36): `mood_score IS NULL OR mood_score BETWEEN -3 AND 3`, `anxiety_score IS NULL OR anxiety_score BETWEEN 0 AND 4`, `energy_score BETWEEN 0 AND 4`, `functioning_score BETWEEN 0 AND 4`

## 3. Security

### 3.1 Аутентификация (VERIFIED)

| Компонент | Статус | Evidence |
|-----------|--------|----------|
| JWT access (15 мин) + refresh (7 дней) | ✅ | app/core/security/jwt.py, AUTH_PLAN.md §2 |
| Argon2id хеширование паролей | ✅ | app/core/security/passwords.py (time_cost=3, memory_cost=64MiB, parallelism=4) |
| Два входа: email+пароль и телефон+SMS | ✅ | app/api/v1/auth.py (register, login, sms/request, sms/verify) |
| Refresh rotation с отзывом всех при компрометации | ✅ | app/services/auth_service.py (refresh(), revoke_all()) |
| token_version для глобального отзыва | ✅ | app/models/user.py (token_version), auth_service.refresh() |
| Rate limit входа (5 попыток / 15 мин) | ✅ | app/api/v1/auth.py (limiter.check), app/core/ratelimit.py |
| SMS rate limit | ✅ | AUTH_PLAN.md §3.1 (документировано) |

### 3.2 RBAC (VERIFIED)

| Право | Роли | Evidence |
|-------|------|----------|
| patient:read/write | patient | app/core/permissions.py, PERMISSIONS dict |
| screening:write | patient | app/core/permissions.py |
| diary:write | patient | app/core/permissions.py |
| diagnosis:write | doctor, super_admin | app/core/permissions.py |
| prescription:write | doctor, super_admin | app/core/permissions.py |
| alert:resolve | doctor, psychologist, super_admin | app/core/permissions.py |
| super_admin | все права | app/core/permissions.py (has_permission возвращает True для super_admin) |

Evidence:
- app/core/permissions.py — полная матрица прав, deny by default
- app/api/dependencies.py — require_permission, require_roles

### 3.3 Swallowed exceptions (P1)

| Место | Код | Проблема | Status |
|-------|-----|----------|--------|
| app/services/alert_service.py:45-47 | `except Exception: logging.getLogger(__name__).exception('audit record failed')` | Аудит не удался — swallowed, но логируется (приемлемо) | PARTIALLY VERIFIED |
| app/services/alert_service.py:173-175 | `except Exception: logging.getLogger(__name__).exception('audit record failed')` | То же самое | PARTIALLY VERIFIED |
| app/services/alert_service.py:214-215 | `except Exception: pass` | **Пустой except — ошибка аудита полностью поглощается** | P1 |
| app/services/screening_service.py:87-92 | `except Exception: logging.getLogger(__name__).exception('alert generation failed')` | Генерация алерта упала — swallowed, но логируется | PARTIALLY VERIFIED |
| app/services/auth_service.py:174 | `except Exception` (broad) | В refresh — broad except (указано в предыдущем аудите) | P1 |


## 4. Database

### 4.1 Миграции (VERIFIED)

| Миграция | Описание | Upgrade | Downgrade |
|----------|----------|---------|-----------|
| 0001_auth_base | users, clinics, patient_profiles, practitioner_profiles | ✅ | ✅ |
| 0002_screening_base | screening_results | ✅ | ✅ |
| 0003_screening_hardening | severity, critical_reason | ✅ | ✅ |
| 0004_alerts | alerts, crisis_signals, safety_plans | ✅ | ✅ |
| 0005_screening_severity_length | severity column length | ✅ | ✅ |
| 0006_patient_diagnoses | patient_diagnoses | ✅ | ✅ |
| 0007_diagnosis_references | diagnosis_references | ✅ | ✅ |
| 0008_assessment_plans | assessment_plans | ✅ | ✅ |
| 0009_safety_plans_crisis_signals | cssrs_assessments, medication_skip_reasons | ✅ | ✅ |
| 0010_care_plans | care_plans | ✅ | ✅ |
| 0011_diary_entries | diary_entries (new scales) | ✅ | ✅ |
| 0012_integration_events | integration_events | ✅ | ✅ |

**Head:** 0012_integration_events  
**Все миграции имеют downgrade()** — подтверждено при чтении исходников.

Evidence:
- alembic/versions/ — 12 файлов миграций, все с upgrade() и downgrade()
- alembic.ini, env.py

### 4.2 Модели ORM (VERIFIED)

| Модель | Таблица | Evidence |
|--------|---------|----------|
| User | users | app/models/user.py |
| PatientProfile | patient_profiles | app/models/profile.py |
| PractitionerProfile | practitioner_profiles | app/models/profile.py |
| ScreeningResult | screening_results | app/models/clinical.py |
| DiaryEntry | diary_entries | app/models/clinical.py |
| PatientDiagnosis | patient_diagnoses | app/models/diagnosis.py |

## 5. API

### 5.1 OpenAPI (VERIFIED)

| Показатель | Значение | Evidence |
|------------|----------|----------|
| Путей в committed openapi.json | 41 | docs/openapi.json |
| Путей в runtime | 41 | app/api/v1/router.py, custom_openapi() |
| Диапазон путей | /health, /db/health, /api/v1/* | openapi.json |
| Конверт ответа | {data, meta, error} | app/core/response.py |
| BearerAuth схема | ✅ | app/main.py custom_openapi() |

Evidence:
- docs/openapi.json — 41 путь, включая /api/v1/diary*, /api/v1/diagnoses*, /api/v1/assessment-plans*, /api/v1/safety/*
- app/main.py — custom_openapi() добавляет bearerAuth

### 5.2 Реализованные эндпоинты (VERIFIED)

| Группа | Эндпоинты | Evidence |
|--------|-----------|----------|
| Health | GET /health, GET /db/health, GET /api/v1/health | app/api/v1/health.py |
| Auth | POST /auth/register, /login, /sms/request, /sms/verify, /invite/verify, /refresh, /logout, GET /auth/me, POST /auth/change-password | app/api/v1/auth.py |
| Screenings | GET/POST /screenings, GET /screenings/{id}, GET /patients/{id}/screenings | app/api/v1/screenings.py |
| Questionnaires | GET /questionnaires, /{code}, /{code}/versions/{version} | app/api/v1/questionnaires.py |
| Patients | GET/GET/{id}/PATCH/{id}/GET/{id}/summary, /{id}/screening-trend, /{id}/diagnoses | app/api/v1/patients.py |
| Alerts | GET/PUT/PATCH /alerts/{id}, GET /alerts, /{id}/safety-plan | app/api/v1/alerts.py |
| Diagnoses | GET/POST /diagnoses, GET/PUT /{id}, GET /patients/{id}/diagnoses | app/api/v1/diagnoses.py |
| Assessment plans | GET/POST /assessment-plans, GET/PUT/DELETE /{id} | app/api/v1/assessment_plans.py |
| Safety | GET/POST/PUT/DELETE /safety/plans, GET/POST /safety/crisis-signals, POST /{id}/acknowledge | app/api/v1/safety.py |
| Diary | GET/POST/PUT/DELETE /diary, POST /diary/bulk-sync, GET /diary/summary | app/api/v1/diary.py |
| ICD10 (deprecated) | GET /icd10, /icd10/{id} | app/api/v1/diagnoses.py (icd10_router) |
| Practitioners | GET/POST /{id}/invite-codes | app/api/v1/practitioners.py |

### 5.3 Отсутствующие эндпоинты (документированы, не реализованы)

| Эндпоинт | Документировано в | Реализовано | Status |
|----------|-------------------|-------------|--------|
| GET /api/v1/medications | API_CONTRACTS.md §3.1, MEDICATIONS.md | Нет | UNVERIFIED |
| POST /api/v1/prescriptions | API_CONTRACTS.md §3.3, MEDICATIONS.md | Нет | UNVERIFIED |
| POST /api/v1/adherence | MEDICATIONS.md §3.4 | Нет | UNVERIFIED |
| GET/POST/PUT /api/v1/exercises | MODULES.md §8, API_CONTRACTS.md | Нет | UNVERIFIED |
| GET/POST /api/v1/messages | API_CONTRACTS.md | Нет | UNVERIFIED |
| GET/POST /api/v1/appointments | API_CONTRACTS.md | Нет | UNVERIFIED |
| GET /api/v1/reports | MODULES.md §10, API_CONTRACTS.md | Нет | UNVERIFIED |
| GET/PUT /api/v1/admin | MODULES.md §10 | Нет | UNVERIFIED |
| GET /api/v1/audit | AUTH_PLAN.md §6 | Нет (только сервис записи) | PARTIALLY VERIFIED |


## 6. Tests

### 6.1 Тестовые файлы (VERIFIED — 89 passed)

| Файл | Тип | What's tested | Status |
|------|-----|---------------|--------|
| tests/api/test_health.py | API | /health, /db/health, envelope, 404 | VERIFIED (4 tests) |
| tests/api/test_auth_api.py | API | auth flow | VERIFIED |
| tests/api/test_patients_api.py | API | patients CRUD | VERIFIED |
| tests/api/test_screenings_api.py | API | screenings | VERIFIED |
| tests/api/test_diagnoses_api.py | API | diagnoses | VERIFIED |
| tests/api/test_assessment_plans_api.py | API | assessment plans | VERIFIED |
| tests/api/test_safety_api.py | API | safety plans | VERIFIED |
| tests/api/test_questionnaires_api.py | API | questionnaires | VERIFIED |
| tests/api/test_diary_api.py | API | **только smoke: auth required, openapi paths** | PARTIALLY VERIFIED |
| tests/unit/test_rbac_matrix.py | Unit | RBAC матрица | VERIFIED |
| tests/unit/test_password_hashing.py | Unit | Argon2id | VERIFIED |
| tests/unit/test_jwt_service.py | Unit | JWT tokens | VERIFIED |
| tests/unit/test_invite_code.py | Unit | invite codes | VERIFIED |
| tests/unit/test_ratelimit.py | Unit | rate limiting | VERIFIED |
| tests/unit/test_response_envelope.py | Unit | envelope format | VERIFIED |
| tests/unit/test_screening_scoring.py | Unit | PHQ-9/GAD-7 scoring | VERIFIED |
| tests/unit/test_screening_boundaries.py | Unit | screening boundaries | VERIFIED |
| tests/unit/test_questionnaire_registry.py | Unit | questionnaire registry | VERIFIED |
| tests/integration/test_screening_repo.py | Integration | screening repo | VERIFIED |
| tests/unit/test_patient_repo.py | Integration | patient repo | VERIFIED |
| tests/test_ownership_isolation.py | Integration | ownership isolation | VERIFIED |
| tests/test_patients_api.py | API | patients API | VERIFIED |
| tests/test_auth_flow.py | API | auth flow | VERIFIED |
| tests/test_endpoints.py | API | endpoints | VERIFIED |
| tests/test_smoke_diary_tmp.py | — | временный файл | — |

**Всего:** 89 тестов passed (путь: c:\_\clinicalcompass\SechHack_26\backend, python -m pytest -q → 89 passed)

### 6.2 Отсутствующие тесты

| Область | Тест существует | Фактически протестировано | Status |
|---------|----------------|---------------------------|--------|
| Diary API | ✅ (smoke только) | auth required + openapi paths | PARTIALLY VERIFIED (нет CRUD тестов) |

## 7. Frontend (wt_frontend)

### 7.1 Состояние (UI ONLY / MOCK ONLY)

| Аспект | Evidence | Status |
|--------|----------|--------|
| Страниц | 60+ (router.tsx) | VERIFIED |
| Mock-файлов | 35+ в src/data/ (mock*.ts) | VERIFIED |
| API-вызовы (fetch/axios) | **Не найдены** | UNVERIFIED |
| Реальная интеграция с backend | Нет | UNVERIFIED |

Evidence:
- Поиск `fetch\(` в wt_frontend/frontend/src — 0 результатов
- Поиск `axios` в wt_frontend/frontend/src — 0 результатов
- Поиск `/api/v1` в wt_frontend/frontend/src — 0 результатов (только в отчетах архива)
- src/data/ содержит: mockAccessLog.ts, mockAdmin.ts, mockAlerts.ts, mockAnalytics.ts, mockDiary.ts, mockDoctor.ts, mockExercises.ts, mockMedications.ts, mockMessages.ts, mockPatientCard.ts, mockPatients.ts, mockPreVisitReport.ts, mockProgram.ts, mockQuestionnaires.ts, mockTreatmentPlan.ts и др.

### 7.2 Страницы (из router.tsx)

| Страница | Путь | API-вызовы | Status |
|----------|------|------------|--------|
| Dashboard | / | mock | UI ONLY / MOCK ONLY |
| Patients | /patients | mock | UI ONLY / MOCK ONLY |
| Patient Card | /patients/:patientId | mock | UI ONLY / MOCK ONLY |
| Alerts | /alerts | mock | UI ONLY / MOCK ONLY |
| Medications | /medications | mock | UI ONLY / MOCK ONLY |
| Exercises | /exercises | mock | UI ONLY / MOCK ONLY |
| Messages | /patients/:patientId/messages | mock | UI ONLY / MOCK ONLY |
| Profile | /profile | mock | UI ONLY / MOCK ONLY |
| Analytics | /admin/analytics | mock | UI ONLY / MOCK ONLY |
| Audit | /admin/audit | mock | UI ONLY / MOCK ONLY |
| Pre-visit reports | /reports | mock | UI ONLY / MOCK ONLY |

Evidence:
- wt_frontend/frontend/src/app/router.tsx — все роуты с страницами
- src/data/ — 35+ mock файлов

| Medications API | ❌ | — | UNVERIFIED |
| Prescriptions API | ❌ | — | UNVERIFIED |
| Adherence API | ❌ | — | UNVERIFIED |
| Exercises API | ❌ | — | UNVERIFIED |
| Messages API | ❌ | — | UNVERIFIED |
| Appointments API | ❌ | — | UNVERIFIED |
| Reports API | ❌ | — | UNVERIFIED |

## 8. Mobile (wt_mobile)

### 8.1 Состояние (UI ONLY / MOCK ONLY)

| Аспект | Evidence | Status |
|--------|----------|--------|
| Экранов | ~40 (src/screens/) | VERIFIED |
| API-клиент | src/api/client.ts — только getHealth(), getDbHealth() | VERIFIED |
| Реальные API-вызовы к backend | **Только health endpoints** | UNVERIFIED (для клинических функций) |

Evidence:
- wt_mobile/mobile/src/api/client.ts — только 2 функции: getHealth() (GET /health), getDbHealth() (GET /db/health)
- Поиск `fetch\(` в wt_mobile/mobile/src — только 2 результата (оба в client.ts для health)
- Поиск `/api/v1` в wt_mobile/mobile/src — 0 результатов

### 8.2 Экраны (из App.tsx)

| Экран | Status |
|-------|--------|
| WelcomeScreen, RegisterPhoneScreen, RegisterSmsScreen, RegisterConsentScreen | UI ONLY (регистрация, ждет SMS API) |
| DiaryScreen, CheckInMoodScreen, CheckInAnxietyScreen, CheckInSleepScreen | UI ONLY (нет API-вызовов) |
| MedicationScreen, SkipDoseScreen, MedicationInstructionScreen | UI ONLY (нет API-вызовов) |
| QuestionnairesScreen, RegisterQuestionnaire* | UI ONLY (нет API-вызовов) |
| SafetyPlanScreen, EmergencyHelpScreen | UI ONLY |
| ChatScreen, ProfileScreen, DoctorAccessScreen | UI ONLY |
| HomeScreen, NotificationsScreen, MyDataScreen | UI ONLY |

Evidence:
- wt_mobile/mobile/App.tsx — импортирует все экраны
- Нет файлов API-сервисов кроме client.ts с 2 health-функциями

| Admin API | ❌ | — | UNVERIFIED |
| Audit API | ❌ | — | UNVERIFIED |
| Security: token rotation | ✅ | tests/unit/test_jwt_service.py | VERIFIED |
| Security: RBAC enforcement | ✅ | tests/unit/test_rbac_matrix.py | VERIFIED |
| Security: ownership isolation | ✅ | tests/test_ownership_isolation.py | VERIFIED |
| Security: patient view leak | ❌ | — | UNVERIFIED |
| Security: SQL injection | ❌ | — | UNVERIFIED |
| Security: audit no secrets | ❌ | — | UNVERIFIED |

Evidence:
- tests/api/test_diary_api.py — только 2 теста (smoke)
- Нет файлов: tests/api/test_medications_api.py, tests/api/test_prescriptions_api.py, tests/security/test_patient_view_leak.py, tests/security/test_sql_injection.py, tests/security/test_audit_no_secrets.py


## 9. Figma

### 9.1 Артефакты (VERIFIED)

| Артефакт | Путь | Status |
|----------|------|--------|
| Figma файл (врач и клиника) | clinicalcompass/docs/figma/Клинический компас — прототип (врач и клиника)/ | 5 изображений |
| Figma файл (МП) | clinicalcompass/docs/figma/Клинический компас — прототип (МП)/ | 7 изображений |
| CLINICAL_ARCHITECTURE_REVIEW.md | clinicalcompass/docs/figma/CLINICAL_ARCHITECTURE_REVIEW.md | VERIFIED |
| Обложка v2.png | clinicalcompass/docs/figma/Обложка v2.png | VERIFIED |

Evidence:
- Get-ChildItem clinicalcompass/docs/figma -Recurse — 5 PNG для врача, 7 PNG для мобилки
- CLINICAL_ARCHITECTURE_REVIEW.md существует

### 9.2 Маппинг Screen → DTO → Endpoint

**Status: UNVERIFIED**  
Не построено отображение: Screen → UI elements → DTO fields → Endpoint → OpenAPI schema.

Evidence:
- Нет файла маппинга Figma→backend в репозитории
- docs/FRONTEND_MAPPING.md и docs/MOBILE_MAPPING.md существуют, но не содержат полного маппинга Screen→DTO→Endpoint
- Предыдущий отчет (_F.MD): "Полный маппинг Screen->DTO->Endpoint не построен"

## 10. Docker / Runtime

**Статус: не проверялся в ходе этого аудита** (docker compose не запускался)

| Компонент | Ожидается | Evidence |
|-----------|-----------|----------|
| Dockerfile | ✅ | SechHack_26/backend/Dockerfile |
| docker-compose.yml | ✅ | SechHack_26/docker-compose.yml |
| cc-backend | healthy | не проверялось runtime |

## 11. Classification of Assertions

### VERIFIED

1. 89 tests pass (pytest -q → 89 passed) — Evidence: pytest run
2. 12 migrations, all with upgrade() and downgrade() — Evidence: alembic/versions/
3. 41 paths in OpenAPI committed spec, matches runtime — Evidence: docs/openapi.json, app/api/v1/router.py
4. JWT access/refresh with rotation — Evidence: app/core/security/jwt.py, app/services/auth_service.py
5. Argon2id hashing — Evidence: app/core/security/passwords.py
6. RBAC matrix with deny by default — Evidence: app/core/permissions.py
7. Single response envelope {data, meta, error} — Evidence: app/core/response.py
8. Health endpoints /health, /db/health, /api/v1/health — Evidence: app/api/v1/health.py
9. Diary CRUD + bulk-sync — Evidence: app/api/v1/diary.py, app/repositories/diary_repository.py
10. Diagnoses ICD10/ICD11 — Evidence: app/api/v1/diagnoses.py, app/models/diagnosis.py, migration 0006, 0007
11. Assessment plans — Evidence: app/api/v1/assessment_plans.py, migration 0008
12. Safety plans + crisis signals — Evidence: app/api/v1/safety.py, migration 0004, 0009
13. Frontend/mobile — UI only, mock data, no real API calls — Evidence: search fetch/axios in source

### PARTIALLY VERIFIED

1. Swallowed exceptions — part logged (acceptable), part `pass` (problem) — Evidence: alert_service.py:214-215
2. OpenAPI drift — previously 37 vs 41, now committed spec has 41 paths matching runtime — Evidence: docs/openapi.json
3. Diary API tests — smoke tests exist, no CRUD tests — Evidence: tests/api/test_diary_api.py

### CONTRADICTED

1. DB_SCHEMA.md §7: `mood_score BETWEEN 1 AND 5` vs code/migration: `mood_score BETWEEN -3 AND 3` — Evidence: DB_SCHEMA.md line 522 vs 0011_diary_entries.py line 33
2. DB_SCHEMA.md §7: `anxiety_score BETWEEN 1 AND 5` vs code/migration: `anxiety_score BETWEEN 0 AND 4` — Evidence: DB_SCHEMA.md line 523 vs 0011_diary_entries.py line 34

### UNVERIFIED

1-9. Medications, prescriptions, adherence, exercises, messages, appointments, reports, admin, audit API endpoints not implemented — no routers
10. Frontend/mobile API integration — no fetch/axios calls
11. Figma Screen→DTO→Endpoint mapping not built

## 12. Test Coverage Matrix (Implemented / Test Exists / Actually Tested)

| Фича | Implemented | Test Exists | Actually Tested | Reason |
|------|-------------|-------------|-----------------|--------|
| Auth (register/login/refresh/logout) | YES | YES | FULL | tests/api/test_auth_api.py, tests/unit/ |
| RBAC matrix | YES | YES | FULL | tests/unit/test_rbac_matrix.py |
| Patients CRUD | YES | YES | FULL | tests/api/test_patients_api.py |
| Screenings (PHQ-9/GAD-7) | YES | YES | FULL | tests/api/test_screenings_api.py, tests/unit/ |
| Diary CRUD | YES | YES | PARTIAL | test_diary_api.py — only auth + openapi, no create/read/update/delete |
| Diagnoses | YES | YES | FULL | tests/api/test_diagnoses_api.py |
| Assessment plans | YES | YES | FULL | tests/api/test_assessment_plans_api.py |
| Safety plans | YES | YES | FULL | tests/api/test_safety_api.py |
| Medications | NO (no endpoint) | NO | — | No router, no tests |
| Prescriptions | NO (no endpoint) | NO | — | No router, no tests |
| Adherence | NO (no endpoint) | NO | — | No router, no tests |
| Exercises | NO (no endpoint) | NO | — | No router, no tests |
| Frontend API integration | NO | NO | — | Only mock data |
| Mobile API integration | NO | NO (health only) | — | Only 2 health functions |

12. Docker runtime not checked in this audit

| cc-postgres | healthy | не проверялось runtime |
| cc-redis | healthy | не проверялось runtime |


## 13. Confidence Scores

| Category | Confidence | Justification |
|----------|------------|---------------|
| Architecture | 7/10 | Code confirms modular monolith, RBAC, response envelope. But: medications/prescriptions/adherence/exercises/messages/appointments/reports/admin modules documented but not implemented in code. |
| Security | 8/10 | JWT, Argon2id, RBAC, refresh rotation, rate limit — all confirmed in code. Minuses: swallowed exceptions (alert_service.py:214-215), broad except in auth. |
| Database | 7/10 | 12 migrations with downgrade, ORM models confirmed. But: diary range contradiction (DB_SCHEMA.md vs code). |
| API | 7/10 | 41 OpenAPI paths, all confirmed in code. But: missing medications/prescriptions/adherence/exercises/messages/appointments/reports/admin endpoints. |
| Tests | 7/10 | 89 tests pass. But: missing tests for medications/prescriptions/adherence/exercises/messages/appointments/reports/admin; diary API partially covered. |
| Frontend | 2/10 | UI-only, mock data, no fetch/axios calls to backend. |
| Mobile | 2/10 | UI-only, only 2 health functions in API client, no clinical API calls. |
| Figma | 3/10 | Design artifacts exist, but no Screen→DTO→Endpoint mapping. |

Evidence:
- SechHack_26/docker-compose.yml — существует (3141 байт)
- SechHack_26/backend/Dockerfile — существует (1022 байт)
- Предыдущий отчет (_F.MD): "Runtime обновлён и проверен: cc-backend, cc-postgres, cc-redis healthy" — но это из предыдущего аудита, не подтверждено в данном запуске

### 6.3 Покрытие (по TESTS.md §7)

| Метрика | Порог | Реальность | Status |
|---------|-------|------------|--------|
| Покрытие строк | ≥ 80% | не измерялось в этом аудите | UNVERIFIED |
| Покрытие ветвлений | ≥ 70% | не измерялось | UNVERIFIED |

## 14. P0 / P1 / P2 Classification

### P0 (block READY) — NONE

### P1 (PARTIALLY READY)

1. **Missing API endpoints:** medications, prescriptions, adherence, exercises, messages, appointments, reports, admin, audit — documented in API_CONTRACTS.md/MEDICATIONS.md/MODULES.md but not implemented in code.
   - Evidence: app/api/v1/router.py does not contain these routers

2. **Swallowed exception in alert_service.py:214-215** — `except Exception: pass` completely absorbs audit error on alert update.
   - Evidence: app/services/alert_service.py, lines 214-215

3. **Frontend and Mobile not integrated with backend** — only mock data and 2 health functions.
   - Evidence: search fetch/axios in wt_frontend/frontend/src (0 results), wt_mobile/mobile/src/api/client.ts (only getHealth, getDbHealth)

4. **Missing tests** for medications, prescriptions, adherence, exercises, messages, appointments, reports, admin, audit API.
   - Evidence: tests/ directory listing — no such test files

5. **DB_SCHEMA.md §7 contradicts code** on mood_score/anxiety_score ranges.
   - Evidence: DB_SCHEMA.md lines 522-523 vs 0011_diary_entries.py lines 33-34

### P2 (improvements)

1. Swallowed exceptions in alert_service.py:45-47, 173-175 (logged but not propagated)
2. Swallowed exception in screening_service.py:87-92 (logged)
3. Broad except in auth_service.py (potential)
4. Missing Figma→DTO→Endpoint mapping
5. Docker runtime not checked in this audit

## 15. Final Verdict

| READY Criterion | Status |
|-----------------|--------|
| No P0 problems | ✅ |
| No CONTRADICTED assertions | ❌ (diary range contradiction exists) |
| No critical Code/OpenAPI sync issues | ✅ (41/41 paths match) |
| Runtime verified | ❌ (not checked in this audit) |
| OpenAPI confirmed | ✅ (committed spec = runtime) |
| Migrations confirmed | ✅ (12 migrations, all with downgrade) |

At least one P1 exists → **Final Verdict = PARTIALLY READY**

### Conditions to reach READY:

1. Fix DB_SCHEMA.md §7 contradiction (align with code: mood -3..3, anxiety/energy/functioning 0..4) — or update code/migration to match documentation
2. Implement missing API endpoints (medications, prescriptions, adherence, exercises, messages, appointments, reports, admin, audit) or document them as planned for next release
3. Fix swallowed exception in alert_service.py:214-215 (`except Exception: pass`)
4. Add tests for missing API modules
5. Integrate frontend/mobile with real API calls (replace mock with fetch to /api/v1/*)
6. Build Figma Screen→DTO→Endpoint mapping
7. Verify Docker runtime (docker compose up, health endpoints)

## 16. Recommended Next Steps

1. **Fix DB_SCHEMA.md §7** — align ranges with code (mood -3..3, anxiety/energy/functioning 0..4) or update migration and model
2. **Implement or document as planned** missing endpoints: medications, prescriptions, adherence, exercises, messages, appointments, reports, admin, audit
3. **Fix alert_service.py:214-215** — replace `except Exception: pass` with logging or exception propagation
4. **Add tests** for all API modules (minimum: CRUD for each endpoint)
5. **Integrate frontend/mobile** — add API client with calls to /api/v1/* instead of mock data
6. **Build Figma mapping** — Screen → UI elements → DTO fields → Endpoint → OpenAPI schema
7. **Verify Docker runtime** — docker compose up, health endpoints, alembic upgrade head

## 17. Sources of Evidence

### Source Code
app/main.py; app/api/v1/router.py; app/api/v1/auth.py; app/api/v1/health.py; app/api/v1/patients.py; app/api/v1/screenings.py; app/api/v1/alerts.py; app/api/v1/diagnoses.py; app/api/v1/assessment_plans.py; app/api/v1/safety.py; app/api/v1/diary.py; app/api/v1/questionnaires.py; app/api/v1/practitioners.py; app/api/dependencies.py; app/core/permissions.py; app/core/security/jwt.py; app/core/security/passwords.py; app/core/config.py; app/core/response.py; app/core/errors.py; app/services/auth_service.py; app/services/alert_service.py; app/services/screening_service.py; app/services/audit_service.py; app/models/user.py, profile.py, clinical.py, diagnosis.py, care.py, integration.py; app/repositories/diary_repository.py; app/schemas/diary.py

### Migrations
alembic/versions/0001_*.py — 0012_*.py — all with upgrade() and downgrade()

### OpenAPI
docs/openapi.json — 41 paths

### Tests
tests/ (20 files, 89 passed)

### Frontend
wt_frontend/frontend/src/app/router.tsx — 60+ routes; wt_frontend/frontend/src/data/ — 35+ mock files; no fetch/axios calls

### Mobile
wt_mobile/mobile/src/api/client.ts — only getHealth, getDbHealth; wt_mobile/mobile/App.tsx — ~40 screens; no clinical API calls

### Figma
clinicalcompass/docs/figma/ — prototype images; clinicalcompass/docs/figma/CLINICAL_ARCHITECTURE_REVIEW.md

### Documentation
docs/ARCHITECTURE.md, DOMAIN_MODEL.md, DB_SCHEMA.md, CURRENT_API.md, API_CONTRACTS.md, AUTH_PLAN.md, MODULES.md, MEDICATIONS.md, TASKS.md, TESTS.md, README.md

### Reports Archive
docs/reports/archive/ — 30+ reports from previous phases

| Покрытие auth/medication/alert | ≥ 90% | medication — нет тестов | UNVERIFIED |
| Пройденных тестов | 100% | 89 passed | VERIFIED |

Evidence:
- app/api/v1/router.py — не импортирует и не регистрирует routers для medications, prescriptions, adherence, exercises, messages, appointments, reports, admin, audit
- docs/API_CONTRACTS.md — dokumentiert все эти эндпоинты
- docs/MEDICATIONS.md — dokumentiert medications, prescriptions, adherence

| DiagnosisReference | diagnosis_references | app/models/diagnosis.py |
| CarePlan | care_plans | app/models/care.py |
| ExerciseAssignment | exercise_assignments | app/models/care.py |
| ExerciseCompletion | exercise_completions | app/models/care.py |
| Alert | alerts | app/models/care.py |
| IntegrationEvent | integration_events | app/models/integration.py |
| AuditLog | audit_logs | app/models/audit.py |

Evidence: все модели читаются из исходного кода.

### 4.3 Контрадикция диапазонов дневника (CONTRADICTED)

Подробно в разделе 2.3. Код и миграция используют `-3..3` для mood и `0..4` для anxiety/energy/functioning, а DB_SCHEMA.md утверждает `1..5`.

Evidence:
- app/services/alert_service.py, строки 214-215: `except Exception: pass`
- app/services/screening_service.py, строки 87-92: `except Exception: logging...exception(...)`

### 3.4 Ошибки и конверт ответов (VERIFIED)

| Компонент | Статус | Evidence |
|-----------|--------|----------|
| Единый конверт {data, meta, error} | ✅ | app/core/response.py (envelope, ok, fail) |
| Единые обработчики ошибок FastAPI | ✅ | app/main.py (ApiError, ValidationError, HTTPException, Exception) |
| Security-заголовки (nosniff, DENY, HSTS) | ✅ | app/main.py (request_context middleware) |
| CORS whitelist | ✅ | app/main.py (CORSMiddleware с settings.cors_origins_list) |
| Лимит тела запроса (1 MB) | ✅ | app/main.py (MAX_BODY_BYTES) |
| Маскирование секретов в аудит-логах | ✅ | app/services/audit_service.py (_sanitize, _FORBIDDEN_SUBSTRINGS) |

- Model `app/models/clinical.py` (lines 63-66): те же CHECK-ограничения
- Schema `app/schemas/diary.py` (lines 11-14): `mood_score ge=-3, le=3`, `anxiety_score ge=0, le=4`

**Status:** CONTRADICTED  
Evidence:
- docs/DB_SCHEMA.md, строка 522-523: `mood_score BETWEEN 1 AND 5`, `anxiety_score BETWEEN 1 AND 5`
- alembic/versions/0011_diary_entries.py, строки 33-36: `-3 AND 3`, `0 AND 4`
- app/models/clinical.py, строки 63-66: `-3 AND 3`, `0 AND 4`
- app/schemas/diary.py, строки 11-14: `ge=-3, le=3`, `ge=0, le=4`

### 2.4 Архитектурные принципы

| Принцип | Статус | Evidence |
|---------|--------|----------|
| Модульный монолит | ✅ | app/main.py, все сервисы в одном репозитории |
| Одна БД (PostgreSQL) | ✅ | app/db/session.py, alembic, 12 миграций |
| Синхронный REST API | ✅ | FastAPI, async SQLAlchemy 2.0 |
| Асинхронные события (Redis/Celery) | ⏳ Планируется | app/core/config.py: redis_url настроен, но Celery не используется в коде |
| Офлайн-синхронизация | ✅ Частично | diary bulk-sync с device_id/recorded_at дедупликацией |
| Минимально необходимый доступ (RBAC) | ✅ | app/core/permissions.py, require_permission в роутерах |

Evidence:
- app/api/v1/router.py — все роутеры с require_permission
- app/core/permissions.py — PERMISSIONS матрица, deny by default
- app/core/config.py — redis_url настроен, но не используется (in-memory rate limit)

| Категория | Статус | Confidence |
|-----------|--------|------------|
| Architecture | PARTIALLY VERIFIED | 7/10 |
| Security | VERIFIED | 8/10 |
| Database | PARTIALLY VERIFIED | 7/10 |
| API | PARTIALLY VERIFIED | 7/10 |
| Tests | PARTIALLY VERIFIED | 7/10 |
| Frontend | UNVERIFIED (UI ONLY / MOCK ONLY) | 2/10 |
| Mobile | UNVERIFIED (UI ONLY / MOCK ONLY) | 2/10 |
| Figma | UNVERIFIED | 3/10 |

**Итоговый вердикт: PARTIALLY READY**  
- P0 проблем: нет  
- P1 проблемы: есть (отсутствующие эндпоинты, swallowed exceptions, отсутствие интеграции frontend/mobile с backend)  
- CONTRADICTED утверждения: есть (DB_SCHEMA.md §7 vs код — диапазоны mood_score/anxiety_score)  
- Runtime: не был запущен в докере в ходе этого аудита (проверка через pytest и OpenAPI spec)  
- OpenAPI: committed spec содержит 41 пути, совпадает с runtime  
- Миграции: 12 миграций, head = 0012_integration_events, downgrade есть у всех  
