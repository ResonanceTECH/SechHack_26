# PHASE 9 — PREPARATION REPORT: Screening Service (PHQ-9 / GAD-7)

**Дата подготовки:** 22.10.2026
**Источник истины:** INDEPENDENT_SYSTEM_AUDIT.md, TASKS.md, MODULES.md, DOMAIN_MODEL.md, DB_SCHEMA.md, API_CONTRACTS.md, CURRENT_API.md, текущий код.
**Фаза:** Phase 9 — Подготовка к реализации Screening Service.

## 1. ЦЕЛЬ ОТЧЁТА

Проверка готовности проекта к реализации Screening Service (PHQ-9 / GAD-7) и составление детального плана реализации.

## 2. DOCKER READINESS

- cc-postgres: postgres:16-alpine, healthy
- cc-redis: redis:7-alpine, healthy
- cc-backend: sechhack_26-backend:latest (ff1b2bb7d515), Up
- SHA-256 хеши всех 42 Python-файлов backend/app/ совпадают между хостом и контейнером: 0 mismatches.
- Orphan-контейнеры: отсутствуют.

**Вывод: Docker READY.**

## 3. ALEMBIC READINESS

- alembic --version: 1.20.0
- alembic heads: 0001_auth_base (head)
- alembic current: 0001_auth_base (head)
- Применённых миграций: 1 (0001_auth_base.py)
- Таблицы: users, clinics, patient_profiles, practitioner_profiles, refresh_tokens, sms_codes, invite_codes, patient_assignments, audit_logs.
- Отсутствуют миграции для: screening_results, diary_entries, alerts, care_plans, exercise_assignments, exercise_completions.

**Вывод: Alembic READY, но требует новую миграцию (0002_screening_base.py).**

## 4. MODELS READINESS

ORM-модель ScreeningResult уже существует в app/models/clinical.py:
- __tablename__ = screening_results
- CheckConstraint score >= 0
- CheckConstraint chk_screening_score_range (phq9 <= 27, gad7 <= 21)
- Index idx_screening_results_patient_id_created_at
- Index idx_screening_results_is_critical
- Поля: patient_id (FK), questionnaire_type, questionnaire_version, score, answers (JSONB), is_critical, created_at

Модель зарегистрирована в app/models/__init__.py.

Отсутствуют: repository, service, router, schemas.

**Вывод: Models PARTIALLY READY.**

## 5. CONTRACTS READINESS

API-эндпоинты (из TASKS.md Этап 3, MODULES.md §3, API_CONTRACTS.md):
- GET /api/v1/screenings — список скринингов
- POST /api/v1/screenings — создать скрининг (ответы → серверный подсчёт)
- GET /api/v1/screenings/{id} — получить по ID
- GET /api/v1/patients/{id}/screenings — скрининги пациента

RBAC (permissions.py):
- screening:write → {patient}
- screening:read → ALL_ROLES

Interpretation thresholds (MODULES.md §3):
PHQ-9: 0-4 минимальная, 5-9 лёгкая, 10-14 умеренная, 15-19 умеренно-выраженная, 20-27 тяжёлая.
GAD-7: 0-4 минимальная, 5-9 лёгкая, 10-14 умеренная, 15-21 тяжёлая.

Critical flag logic (TASKS.md Этап 3 п.4):
- PHQ-9: п.9 >= 1 ИЛИ score >= 20 → is_critical = True
- GAD-7: score >= 15 → is_critical = True

**Вывод: Contracts READY.**

## 6. TESTS READINESS

Существующие тесты: Auth, Patient, Health.
Отсутствуют: unit-тесты scoring, API-тесты screenings, integration-тесты.
Тестовая инфраструктура: conftest.py (skip DB если PG недоступен), PostgreSQL доступен.

**Вывод: Tests NOT READY (требуется создать).**

## 7. ДЕТАЛЬНЫЙ ПЛАН РЕАЛИЗАЦИИ

### Этап 7.1 — Тесты (Test-First)
1. tests/unit/test_phq9_scoring.py — подсчёт баллов, интерпретация, critical flag, валидация.
2. tests/unit/test_gad7_scoring.py — подсчёт баллов, интерпретация, critical flag, валидация.
3. tests/api/test_screenings_api.py — CRUD, RBAC, валидация.

### Этап 7.2 — Alembic Migration
Создать alembic/versions/0002_screening_base.py (autogenerate + ручная проверка).

### Этап 7.3 — Repository
Создать app/repositories/screening_repository.py:
- create_screening, get_screening_by_id, get_screenings_by_patient, get_screenings_for_user.

### Этап 7.4 — Service (Scoring Logic)
Создать app/services/screening_service.py:
- score_phq9, interpret_phq9, is_critical_phq9
- score_gad7, interpret_gad7, is_critical_gad7
- create_screening (async)

### Этап 7.5 — Schemas
Создать app/schemas/screening.py:
- ScreeningCreateRequest, ScreeningResponse, ScreeningListItem.

### Этап 7.6 — Router
Создать app/api/v1/screenings.py (4 эндпоинта).
Зарегистрировать в app/api/v1/router.py.

### Этап 7.7 — Integration with Patient Service
Обновить PatientService для включения последних скринингов.

### Этап 7.8 — Swagger/OpenAPI
Обновить openapi.json и CURRENT_API.md.

### Этап 7.9 — Финальная проверка
pytest, alembic upgrade head, Swagger, отчёт.

## 8. ЗАВИСИМОСТИ И РИСКИ

Зависимости:
- Patient Profile: ScreeningResult.patient_id → PatientProfile.id (Patient Service готов).
- RBAC: permissions.py содержит screening:write и screening:read.
- Alembic: env.py импортирует app.models.

Риски:
- Неверный подсчёт баллов → Unit-тесты на граничные значения.
- Утечка данных → Ownership isolation tests.
- Миграция не применяется → Тест на чистой БД.
- Клиентский score → Серверный подсчёт.

## 9. ИТОГОВАЯ ОЦЕНКА ГОТОВНОСТИ

| Компонент | Статус |
|---|---|
| Docker | READY |
| Alembic | READY (требует миграцию) |
| Models (ORM) | PARTIAL |
| Contracts (API/RBAC/Domain) | READY |
| Tests | NOT READY |
| Scoring Logic | NOT IMPLEMENTED |
| Repository | NOT IMPLEMENTED |
| Service | NOT IMPLEMENTED |
| Router/Endpoints | NOT IMPLEMENTED |
| Schemas | NOT IMPLEMENTED |

### Общая оценка: ГОТОВ К РЕАЛИЗАЦИИ

Все предпосылки готовы. Требуется реализовать: scoring logic, repository, service, schemas, router, migration, tests.

## 10. ССЫЛКИ НА ИСТОЧНИКИ ИСТИНЫ

1. INDEPENDENT_SYSTEM_AUDIT.md
2. TASKS.md §6 (Этап 3 — Скрининги)
3. MODULES.md §3 (Screening Service)
4. DOMAIN_MODEL.md §1.5 (ScreeningResult)
5. DB_SCHEMA.md §1 (screening_results)
6. API_CONTRACTS.md §7 (Скрининг)
7. CURRENT_API.md
8. AUTH_PLAN.md §5.2 (RBAC)
9. Текущий код: app/models/clinical.py, app/core/permissions.py, app/api/v1/router.py
