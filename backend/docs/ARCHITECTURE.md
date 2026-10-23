# Архитектура бэкенда — модульный монолит (MVP) — v2

**Источник:** `ТЗ_Клинический_Компас_v1.0.md` §8, `Архитектурный_дизайн_моделей.md`, `Технологический_стек.md`  
**Версия:** 2.0  
**Дата:** 2026-10-22  

## 1. О документе

Данный документ (v2) разделяет **целевую архитектуру** (полный набор сервисов из ТЗ) и **текущее состояние реализации** (этапы 0–3, фактически работающий код).

- **«Что есть»** — модули, реально зарегистрированные в FastAPI-приложении (см. `CURRENT_API.md`).
- **«Что планируется»** — модули, описанные в ТЗ и экранах Figma, но ещё не реализованные в коде.

Полный набор целевых эндпоинтов — в `API_CONTRACTS.md`.  
Реализованные эндпоинты — в `CURRENT_API.md`.

---

## 2. Общая схема (целевая)

```
┌─────────────────────────────────────────────────────────────┐
│                     Клиенты (мобилка / веб)                  │
│  React Native + Expo  │  React + Vite + TS                   │
└──────────┬────────────┬──────────────────────────────────────┘
           │ HTTPS / JSON
           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API-шлюз (FastAPI)                      │
│  Routing • Аутентификация (JWT) • RBAC • CORS • Логирование  │
└──────────┬────────────┬──────────────────────────────────────┘
           │            │
   ┌───────┴───────┐ ┌──┴───────┐
   │ auth-service  │ │ patient- │
   │ patient-serv. │ │ service  │
   │ screening-s.  │ │ diary-s. │
   │ program-s.    │ │ alert-s. │
   │ admin-s.      │ │ notif-s. │
   │ audit-s.      │ │ med-s.   │
   └───────┬───────┘ └────┬─────┘
           │              │
   ┌───────┴───────┐ ┌────┴─────────┐
   │   PostgreSQL  │ │  PostgreSQL  │
   │   (одна БД)   │ │  (одна БД)   │
   │  concept01    │ │  concept02   │
   │  (общий)      │ │  (рецептур.) │
   └───────────────┘ └──────────────┘
           │
   ┌───────┴───────┐
   │    Redis      │
   │  (кеш + Celery)│
   └───────────────┘
```

---

## 3. Принципы

| Принцип | Реализация |
|---|---|
| **Модульный монолит** | Все сервисы в одном репозитории, чёткие границы модулей, возможность выноса в микросервисы позже |
| **Одна БД** | PostgreSQL; логическое разделение concept01 (общий) и concept02 (рецептурный); параметры подключения задаются через environment variables |
| **Синхронный API** | REST over HTTP (JSON), OpenAPI/Swagger через FastAPI |
| **Асинхронные события** | Redis Pub/Sub + Celery — планируется (сейчас не реализовано) |
| **Офлайн-синхронизация** | Оптимистичная репликация + флаг `synced_at` (мобилка хранит локально, отправляет пакет при сети) — планируется |
| **Минимально необходимый доступ** | RBAC, доступ к медданным только по служебной необходимости |

## 4. Текущее состояние реализации («Что есть»)

### 4.1 Реализованные модули (этапы 0–3)

| Модуль | Файлы | Статус | Эндпоинты |
|---|---|---|---|
| `auth-service` | `auth.py`, `auth_service.py`, `sms_service.py`, `invite_service.py` | ✅ Реализован | register, login, sms/request, sms/verify, invite/verify, refresh, logout, me, change-password |
| `patient-service` | `patients.py`, `patient_service.py`, `patient_repository.py` | ✅ Реализован | GET/POST patients, GET/PATCH patient/{id} |
| `screening-service` | `screenings.py`, `screening_service.py`, `screening_repository.py` | ✅ Реализован | screenings, patient screenings, questionnaires |
| `alert-service` | `alerts.py`, `alert_service.py`, `alert_repository.py` | ✅ Реализован | alerts (GET, acknowledge, resolve) |
| `audit-service` | `audit_service.py` | ✅ Частично | audit logs (внутренний) |
| `health` | `health.py` | ✅ Реализован | /health, /db/health, /api/v1/health |

### 4.2 Не реализованные модули («Что планируется»)

| Модуль | Ответственность (из ТЗ) | Статус | Планируемые эндпоинты |
|---|---|---|---|
| `diary-service` | Микро-отметки дневника, графики, офлайн-синхронизация | ⏳ Планируется | `/api/v1/diary/*` |
| `program-service` | Назначенные упражнения, программы сопровождения, приверженность | ⏳ Планируется | `/api/v1/programs/*`, `/api/v1/exercises/*` |
| `medication-service` | Данные по лекарствам, рецепты, приверженность | ⏳ Планируется (частично — skip endpoint) | `/api/v1/medications/*`, `/api/v1/prescriptions/*`, `/api/v1/adherence/*` |
| `notification-service` | Push (FCM), SMS, email-уведомления | ⏳ Планируется | `/api/v1/notifications/*`, `/api/v1/devices/*` |
| `report-service` | Генерация отчётов, PDF-экспорт, аналитика клиники | ⏳ Планируется | `/api/v1/reports/*` |
| `admin-service` | Управление ролями, правами, настройками клиники | ⏳ Планируется | `/api/v1/admin/*` |
| `crisis-service` | Кризисные сигналы SOS, план безопасности, ICD-10, C-SSRS | ⏳ Планируется | `/api/v1/crisis/*`, `/api/v1/safety-plan/*`, `/api/v1/icd10/*`, `/api/v1/cssrs/*` |

### 4.3 Целевые модули (полный набор из ТЗ)

| Модуль | Ответственность | Контур | Технология | Статус |
|---|---|---|---|---|
| `auth-service` | Аутентификация, авторизация, JWT, роли, профили пользователей, согласия (152-ФЗ) | Общий | FastAPI + SQLAlchemy | ✅ Реализован |
| `patient-service` | Данные пациентов, карточки, регистрация, согласия | Общий | FastAPI + SQLAlchemy | ✅ Реализован |
| `screening-service` | PHQ-9, GAD-7 и другие скрининги, интерпретация результатов, подсчёт баллов | Общий | FastAPI + SQLAlchemy | ✅ Реализован |
| `diary-service` | Микро-отметки дневника, графики, офлайн-синхронизация | Общий | FastAPI + SQLAlchemy | ⏳ Планируется |
| `program-service` | Назначенные упражнения, программы сопровождения, приверженность | Общий | FastAPI + SQLAlchemy | ⏳ Планируется |
| `alert-service` | Обнаружение критических симптомов, алерты врачу, план безопасности | Общий | FastAPI + Celery | ✅ Реализован |
| `medication-service` | Данные по лекарствам (полная инфа врачу / упрощённая пациенту) | Общий (логически concept02) | FastAPI + SQLAlchemy | ⏳ Планируется |
| `notification-service` | Push (FCM), SMS, email-уведомления | Общий | FastAPI + Celery | ⏳ Планируется |
| `report-service` | Генерация отчётов о динамике, PDF-экспорт, аналитика клиники | Общий | FastAPI | ⏳ Планируется |
| `admin-service` | Управление ролями, правами, тарификацией, настройками клиники | Общий | FastAPI | ⏳ Планируется |
| `audit-service` | События доступа и изменения критических данных | Общий | FastAPI | ✅ Частично |
| `crisis-service` | Кризисные сигналы SOS, план безопасности, ICD-10, C-SSRS | Общий | FastAPI + SQLAlchemy | ⏳ Планируется |

---

## 5. Механизмы взаимодействия

| Тип | Механизм | Описание | Статус |
|---|---|---|---|
| Синхронный запрос-ответ | REST over HTTP (JSON) | Клиент → API-шлюз → модуль. Все эндпоинты документируются через OpenAPI/Swagger. | ✅ Реализован |
| Асинхронные события | Redis Pub/Sub + Celery | Например, создание отметки дневника публикует событие `diary.entry.created`, на которое подписывается `alert-service`. | ⏳ Планируется |
| Изоляция контуров | Логическое разделение в одной БД | Рецептурный контур не имеет прямого доступа к таблицам общего контура; обмен только через DTO и строго определённые контракты. | ✅ Логическое разделение |
| Офлайн-синхронизация | Оптимистичная репликация + `synced_at` | Мобильный клиент хранит локально (AsyncStorage), при появлении сети отправляет пакет изменений с метками времени. | ⏳ Планируется |

---

## 6. Что НЕ делаем на старте

- Выделение concept02 в отдельную БД — только логическое разделение
- Keycloak / OIDC — только собственные JWT
- Парсинг ГРЛС через API — данные по лекарствам согласно экранам Figma
- Redis/Celery — планируется, не реализовано
- Полная реализация всех 11 сервисов — поэтапно согласно TASKS.md

---

## 7. Источники истины

| Документ | Назначение |
|---|---|
| `CURRENT_API.md` | Реально зарегистрированные эндпоинты (source of truth для реализованного API) |
| `API_CONTRACTS.md` | Целевые контракты (включая будущие эндпоинты) |
| `MODULES.md` | Детализация модулей и границ |
| `DB_SCHEMA.md` | Схема БД (DDL) |
| `AUTH_PLAN.md` | Аутентификация и авторизация |
| `DOMAIN_MODEL.md` | Доменные сущности |
| `TASKS.md` | Порядок реализации по этапам |

---

## Clinical Architecture Update — Phase 11.0 (2026-10-23)

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

Chain: Diagnosis → Assessment Plan → Screening → Trend. Missing: `AssessmentPlan` (patient_id, questionnaire_code, interval_days, enabled, start_date, end_date) and optional `SymptomTrend`. Screening itself already supports PHQ-9/GAD-7/PDSS/HCL-33/C-SSRS via registry/versioning; MBC adds scheduling.

### Diary Rework

New scales: mood -3..+3, anxiety 0..4, energy 0..4, functioning 0..4. Add `functioning_score`. Micro-diary (partial entries, nullable fields). Migration: ALTER CHECK constraints + ADD COLUMN; data mapping decision required.

### Safety Plan Architecture

SafetyPlan remains patient-specific entity. Reusable clinical content (AWARE, depression handouts, crisis algorithm, relative/doctor instructions) moves to `SafetyPlanTemplate` / `ClinicalContentLibrary`, referenced via nullable `template_id` + override. Structured contacts (JSONB) and crisis steps.

### Screening Expansion

Already supported via Questionnaire Registry/versioning: PHQ-9, GAD-7. PDSS, HCL-33, C-SSRS require registry entries + scoring rules + critical rules; no core architecture change, but C-SSRS is clinical safety instrument (consider dedicated entity).

### Patient Card Requirements

Missing blocks: diagnoses (active + history + primary), assessment schedule, adherence, safety plans, crisis history, screening trends.
