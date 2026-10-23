# Порядок реализации MVP — практический план

**Источник:** `docs/product/backend/*`  
**Формат:** не календарный план на 8 недель, а последовательность шагов с критериями готовности. Каждый шаг завершается работающим кодом + тестами.

## Общие правила

1. Каждый шаг заканчивается зелёными тестами и мержем в `main`.
2. Ни один шаг не начинается, пока не закрыт предыдущий.
3. Схема БД меняется только через Alembic-миграцию; миграция — в том же PR, что и код.
4. Фронтенд (`frontend_dev`) подключается к API по этапам 8–11 через мок-слой.

---

## Этап 0. Фундамент проекта

**Статус:** ✅ Completed

**Шаги:**
1. Инициализация репозитория `backend/`: `pyproject.toml`, `ruff`, `mypy`, `pytest`.
2. Структура пакетов: `app/{core,api,db,models,schemas,services,repositories,workers}`.
3. Конфигурация через `pydantic-settings` (`\.env.example` → `.env`).
4. Подключение к `sechhack`: asyncpg + SQLAlchemy 2.0, session factory, `Base`.
5. Подключение Redis (для rate-limit и Celery).
6. Alembic: инициализация, настройка `include_schemas=True`, первая миграция `base`.
7. Каркас приложения: `main.py`, health-check `GET /health`, middleware ошибок, request-id middleware, структурированное логирование, CORS, лимит тела запроса.
8. Конверт ответа `{data, meta, error}` + обработчик исключений.
9. `docker-compose.yml` для локальной разработки (postgres + redis + api).
10. CI: workflow на установку зависимостей, `ruff`, `mypy`, `pytest`.

**Готово когда:** `GET /health` отвечает 200, `alembic upgrade head` создаёт схему, пустой `pytest` проходит, CI зелёный.

---

## Этап 1. Аутентификация и RBAC

**Статус:** ✅ Completed

**Шаги:**
1. Модели `User`, `Clinic`, `PatientProfile`, `PractitionerProfile`, `RefreshToken`; миграция.
2. `security/passwords.py` — Argon2id (параметры из `AUTH_PLAN.md`).
3. `security/jwt.py` — кодирование/декодирование access и refresh, проверка `type`, `exp`.
4. `services/auth_service.py` — регистрация, логин, refresh с rotation, logout, отзыв всех токенов.
5. Хранение только хеша refresh-токена (SHA-256).
6. `dependencies/auth.py` — `get_current_user`, `require_roles(...)`, `require_permission(...)`.
7. Матрица прав из `AUTH_PLAN.md` §5.2 — единый словарь в `core/permissions.py`.
8. Rate limit входа (Redis, 5 попыток / 15 мин).
9. `audit-service` — сервис записи событий в `audit_logs` (whitelist полей, без секретов).
10. Роутеры `POST /auth/register|login|refresh|logout`, `GET /auth/me`, `POST /auth/change-password`.
11. Тесты: `tests/unit/test_password_hashing.py`, `test_jwt_service.py`, `test_rbac_matrix.py`, `tests/api/test_auth_api.py`, `tests/security/test_token_rotation.py`, `test_rate_limit.py`.

**Готово когда:** вход/refresh/logout работают, отзыв токенов работает, RBAC закрывает все эндпоинты, тесты покрывают ≥ 90 % модуля `auth`.

---

## Этап 2. Клиника, пациенты, специалисты

**Статус:** ✅ Completed (Auth/Patient/Practitioner invite; admin/audit/report остаются запланированными)

**Шаги:**
1. CRUD пациентов и специалистов, привязка к клинике.
2. Согласия (152-ФЗ): поля `consent_*` в профиле, обязательны при регистрации, фиксируется `consent_data_processing_at`.
3. Список пациентов с фильтрами (клиника, врач, поиск по ФИО, риск-уровень).
4. Карточка пациента: демография + агрегаты (последние скрининги, активные алерты, программы) — агрегаты подключаются в этапах 3–7, до этого заглушка.
5. `admin-service`: список сотрудников, смена роли (с аудитом).
6. Тесты: `test_patient_repo.py`, `test_patients_api.py`, `test_admin_api.py`, `test_ownership_isolation.py`.

**Готово когда:** пациент видит только себя; врач видит пациентов своей клиники; смена роли попадает в аудит.

---

## Этап 3. Скрининги (PHQ-9, GAD-7)

**Статус:** ✅ Completed (Phase 9.1–9.3: PHQ-9/GAD-7, registry, scoring, severity, critical rules, endpoints, migrations 0002/0003)

**Шаги:**
1. Шаблоны опросников в коде/конфиге: тексты вопросов, веса ответов, шкалы интерпретации.
2. Модель `ScreeningResult` + миграция.
3. Сервис подсчёта баллов и интерпретации (пороги — в `MODULES.md` §3).
4. Определение критического результата (п.9 ≥ 1; сумма ≥ 20 / GAD-7 ≥ 15).
5. Эндпоинты `GET/POST /screenings`, `GET /screenings/{id}`, `GET /patients/{id}/screenings`.
6. История и график динамики.
7. Тесты: `test_screening_scoring.py` (все границы шкал), `test_screening_api.py`, `test_screening_repo.py`.

**Готово когда:** балл считается только на сервере, клиентский `score` игнорируется; все пороги покрыты тестами.

---

## Этап 4. Дневник и офлайн-синхронизация

**Статус:** ⚪ Planned

**Шаги:**
1. Модель `DiaryEntry` + миграция с CHECK-ограничениями.
2. CRUD дневника, доступ — только свой для пациента.
3. `POST /diary/bulk-sync` — приём пакета, дедупликация по `(device_id, recorded_at, patient_id)`, проставление `synced_at`.
4. Идемпотентность: повторная отправка того же пакета не создаёт дублей.
5. Агрегаты за период (`GET /diary/summary`): средние, тренд.
6. Правило «пропуск дневника ≥ 3 дня» — заглушка детектора (алерты — этап 6).
7. Тесты: `test_diary_sync.py`, `test_diary_api.py`, `test_sql_injection.py`.

**Готово когда:** повторный bulk-sync не меняет количество записей; CHECK-ограничения отражаются в 422.

---

## Этап 5. Программы и упражнения

**Статус:** ⚪ Planned

**Шаги:**
1. Модели `CarePlan`, `ExerciseAssignment`, `ExerciseCompletion` + миграция.
2. Назначение упражнения врачом; пациент видит только свои.
3. Отметка выполнения; расчёт adherence.
4. Правило «упражнение просрочено» — заглушка детектора.
5. Эндпоинты `GET/POST /care-plans`, `GET/POST/PUT /exercises`, `POST /exercises/{id}/complete`, `GET /exercises/{id}/compliance`.
6. Тесты: `test_alert_rules.py` (часть adherence), API-тесты программ.

**Готово когда:** психолог может назначать упражнения, но не рецепты (разделение прав проверяется тестом).

---

## Этап 6. Алерты и план безопасности

**Статус:** 🟡 In Progress (alert foundation/constants in screening hardening; Alert Service not fully implemented)

**Шаги:**
1. Модель `Alert` + миграция.
2. Детекторы правил из `MODULES.md` §6 — чистые функции, легко тестируемые без БД.
3. Жизненный цикл `new → in_progress → resolved|dismissed`, фиксация `resolved_by`/`resolved_at`.
4. План безопасности: статический пошаговый протокол для `critical_symptom` / `mandatory`.
5. Эндпоинты `GET /alerts`, `GET /alerts/{id}`, `PUT/PATCH /alerts/{id}`, `GET /alerts/{id}/safety-plan`.
6. Дедупликация: повторное срабатывание правила не плодит алерты (по типу + пациенту + окну).
7. Тесты: `test_alert_rules.py`, `test_alert_lifecycle.py`, `test_alerts_api.py`.

**Готово когда:** PHQ-9 с п.9 ≥ 1 создаёт `mandatory`-алерт; повторный прогон не дублирует.

---

## Этап 7. Лекарства и рецепты

**Статус:** ⚪ Planned

**Шаги:**
1. Схема `rx` + модели `Medication`, `Prescription`, `MedicationAdherence` + миграция.
2. CRUD справочника в `admin-service` (с проверкой `instructions_url`).
3. Назначение рецепта врачом; снятие — `is_active=false` + аудит.
4. Две схемы ответа: `MedicationFull` (врач) и `MedicationBrief` (пациент) — разделение на уровне `response_model`.
5. Отметки приёма; adherence; алерт `rx` при 3 пропусках подряд.
6. Тесты: `test_medications_api.py`, `tests/security/test_patient_view_leak.py`.

**Готово когда:** тест `test_patient_view_leak` гарантирует отсутствие `contraindications`/`interactions`/`side_effects` в ответе пациенту.

---

## Этап 8. Уведомления и сообщения

**Статус:** ⚪ Planned

**Шаги:**
1. Модели `UserDevice`, `Notification`, `Message` + миграция.
2. Регистрация push-токена устройства.
3. Шаблоны уведомлений; отправка — заглушка с логированием (FCM отложен).
4. Celery-воркер: очередь доставки, повторы, dead-letter.
5. Переписка врач ↔ пациент, статус прочтения.
6. **Тексты уведомлений не содержат клинических данных** — только «новое событие в приложении».
7. Тесты: API-тесты сообщений; проверка отсутствия медданных в тексте уведомления.

**Готово когда:** врач отправляет сообщение пациенту, пациент читает его в приложении, статус прочтения обновляется.

---

## Этап 9. Аналитика и отчёты

**Статус:** ⚪ Planned

**Шаги:**
1. Запросы агрегации: Screening Completion Rate, Activation Rate, приверженность дневнику/упражнениям/препаратам, средний балл в динамике.
2. `GET /admin/analytics` — формат под mock-контракты `mockAnalytics.ts`.
3. `GET /reports/pre-visit/{patientId}` — PDF-отчёт перед визитом.
4. Тесты: сверка расчётов с фикстурами; проверка доступа (только clinic_admin/super_admin для аналитики).

**Готово когда:** JSON аналитики совместим с mock-контрактом фронтенда без изменений на его стороне.

---

## Этап 10. Аудит и защита

**Статус:** ⚪ Planned (audit model/service partially present, API not registered)

**Шаги:**
1. Аудит чтения карточки пациента, изменения ролей, назначений, закрытия алертов.
2. Просмотр журнала в `admin-service` с фильтрами.
3. Реализация всех мер из `AUTH_PLAN.md` §8 (заголовки, лимит тела, маскирование ПД в логах).
4. Тесты `tests/security/*` — все 10 обязательных проверок зелёные.

**Готово когда:** полный набор security-тестов проходит; в логах нет email/телефонов/ФИО в открытом виде.

---

## Этап 11. Подключение фронтенда

**Статус:** ⚪ Planned

**Шаги:**
1. Сверка фактических контрактов с mock-данными `frontend_dev` (`mockPatients`, `mockAlerts`, `mockAnalytics`).
2. Замена мок-слоя на реальный клиент — по BFF-эндпоинтам кабинета врача.
3. Обработка ошибок и 401 на клиенте (обновление токена, редирект на логин).
4. CORS для dev-окружения фронтенда.
5. Интеграционный smoke-тест: сценарий «логин врача → список пациентов → карточка → закрытие алерта».

**Готово когда:** врачебный кабинет работает на реальном API без изменений в UI-коде фронтенда.

---

## Этап 12. MVP-готовность

**Статус:** ⚪ Planned

**Шаги:**
1. Нагрузочная проверка базовых сценариев (профиль из пилотной нагрузки).
2. Проверка миграций на чистой БД и на БД с данными (upgrade path).
3. Финальный прогон всех тестов, покрытие ≥ 80 %.
4. Документация: OpenAPI (`/docs`), `README` для запуска, `.\.env.example` без секретов.
5. Чек-лист соответствия 152-ФЗ: согласия, аудит, разделение доступа, сокращённый контур лекарств.

**Готово когда:** развёртывается одним docker-compose, тесты зелёные, все документы в `docs/product/backend/` соответствуют коду.

---

## Порядок по критичности

| Приоритет | Этапы | Обоснование |
|---|---|---|
| P0 — блокирует всё | 0, 1 | Без аутентификации и каркаса ничего не работает |
| P0 — клинический минимум | 3, 6 | Скрининги и алерты — ядро ценности продукта |
| P1 — сопровождение пациента | 4, 5, 7 | Дневник, упражнения, лекарства |
| P1 — вовлечение | 8 | Уведомления и сообщения удерживают пациента |
| P2 — для клиники | 9, 10 | Аналитика, аудит, ИБ-контур |
| P2 — интеграция | 11, 12 | Подключение фронтенда и выпуск |

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
