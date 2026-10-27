# FULL AUDIT — PRE-API INTEGRATION

Дата: 2026-10-25
Область: backend (`SechHack_26/backend`), frontend (`frontend_dev/frontend`), mobile (`mobile_dev/mobile`)
Тип: аудит перед интеграцией клиентов с API

## 1. Executive summary

- Backend: готов к интеграции на уровне API. 23 router-модуля, 76 путей в OpenAPI, 27 тестовых файлов, 107 тестов проходят, миграции на head `0031_rls_remaining_phi`.
- Frontend: только UI/MOCK. 195 source-файлов, 37 mock-файлов, 60+ маршрутов, но нет ни одного `fetch/axios` к backend.
- Mobile: только UI/MOCK. 85 source-файлов, 40+ экранов, API-клиент содержит только `getHealth` и `getDbHealth`.
- Главный блокер интеграции: отсутствие клиентского API-слоя, типов, auth-token lifecycle и замены mock-данных.
- Backend-долги: довести diary CRUD-тесты (RLS, audit, cross-clinic — выполнены).

Итоговый статус: PARTIALLY READY. Backend готов; frontend/mobile не подключены к API.

## 2. Метод аудита

Проверено:
- `python -m pytest -q` в `SechHack_26/backend` -> 107 passed.
- `alembic current` -> `0032_versions_trends (head)`.
- OpenAPI JSON -> 76 путей.
- Поиск `fetch(` / `axios` / `/api/v1` в frontend и mobile source.
- Подсчёт source/mock файлов.
- Проверка router-модулей и базовых инфраструктурных компонентов.

## 3. Backend status (VERIFIED)

### 3.1 Инфраструктура
- Единый конверт `{ data, meta, error }` — `app/core/response.py`.
- Единые обработчики ошибок FastAPI — `app/main.py`.
- Security headers, CORS whitelist, лимит тела запроса (1 MB) — `app/main.py`.
- RBAC deny-by-default — `app/core/permissions.py`.
- JWT auth — `app/core/security/jwt.py`.
- Clinic isolation: primary + membership clinic ids.
- Audit: `audit_events` table/model, `record_security_event`; wired in `get_current_user` (success-path `clinic_isolation.allowed`).
- RLS: applied to `patient_profiles` and all patient-linked PHI tables (`screening_results`, `diary_entries`, `care_plans`, `exercise_completions`, `alerts`, `prescriptions`, `safety_plans`, `crisis_signals`, `patient_assignments`, `assessment_plans`, `appointments`, `patient_name_history`, `messages`, `clinic_settings`, `practitioner_clinic_memberships`) via migrations `0028`-`0031`.
- Migration head: `0031_rls_remaining_phi`.
- Multi-clinic: exercise, medication, message, report, schedule services translated to `practitioner_clinic_ids()`.

### 3.2 Реализованные API-домены
Auth, practitioners, patients, screenings, diagnoses, assessment plans, safety, questionnaires, diary, medications/prescriptions/adherence, exercises, messages, appointments/schedule, reports, admin, audit, integrations.

### 3.3 Тесты
- 27 тестовых файлов.
- 107 passed.
- Unit/integration/API/cross-clinic тесты.
- Diary API: только smoke, CRUD-тесты отсутствуют.

### 3.4 Оставшиеся backend-долги
1. Diary CRUD-тесты (единственный невыполненный пункт Phase B).
2. Дальнейшая актуализация `F.MD`/`BACKEND_SPEC.md` при изменениях.

## 4. Frontend status (UI ONLY / MOCK ONLY)

### 4.1 Факты
- Source-файлов: 195.
- Mock-файлов: 37 (`src/data/mock*.ts`).
- Маршрутов: 60+ (`src/app/router.tsx`).
- `fetch(`: 0 результатов.
- `axios`: 0 результатов.
- `/api/v1`: 0 результатов в source.

### 4.2 Что не хватает до интеграции API
1. API-клиент с base URL, envelope parsing, ошибками и retry.
2. Хранение auth token (access/refresh) и logout.
3. Типы DTO, сгенерированные из OpenAPI.
4. Data layer вместо mock-файлов (services/hooks).
5. Loading/error/empty states на экранах.
6. Замена mock-данных на реальные вызовы по доменам.
7. Единая обработка 401/403/422.
8. Env-конфигурация (`VITE_API_URL`).
9. Figma Screen -> DTO -> Endpoint mapping.

### 4.3 Рекомендуемый порядок
1. Auth (login/refresh/logout).
2. Patients list/card.
3. Diary/check-ins.
4. Questionnaires.
5. Medications/prescriptions.
6. Appointments/messages.
7. Alerts/reports/admin.

## 5. Mobile status (UI ONLY / MOCK ONLY)

### 5.1 Факты
- Source-файлов: 85.
- Экранов: 40+.
- API-клиент: только `getHealth`, `getDbHealth`.
- Нет auth SMS/invite flow на уровне API.
- Нет secure storage токенов.
- Нет offline-sync/idempotency wiring.

### 5.2 Что не хватает до интеграции API
1. Полноценный API-клиент с envelope parsing и ошибками.
2. Secure storage access/refresh tokens.
3. Auth flow: SMS request/verify, invite verify, consent.
4. Patient self-service endpoints (diary, questionnaires, medications, appointments, messages).
5. Offline queue + idempotency keys + retry.
6. Push/notification integration (если требуется).
7. Обработка сетевых ошибок и offline states.

### 5.3 Рекомендуемый порядок
1. Auth (phone -> SMS -> consent -> invite).
2. Home/dashboard.
3. Diary/check-ins.
4. Questionnaires.
5. Medications.
6. Appointments.
7. Messages/notifications.

## 6. Roadmap до состояния "интеграция API"

### Phase A - Контракт и клиентский foundation
- Зафиксировать OpenAPI как источник истины.
- Сгенерировать TS-типы для frontend и mobile.
- Создать API-клиент с envelope parsing и typed errors.
- Добавить env-конфиги и auth token storage.

### Phase B - Backend hardening
- ✅ Расширить RLS на все PHI-таблицы (миграции `0028`–`0031`).
- ✅ Подключить AuditService к denial/access paths (success-path `clinic_isolation.allowed` в `get_current_user`).
- ✅ Добавить cross-clinic negative tests (`tests/test_cross_clinic_isolation.py`).
- ⏳ Добавить diary CRUD-тесты (остаётся).
- ✅ Актуализировать `F.MD` (Phase 44 update) и `BACKEND_SPEC.md`.

### Phase C - Frontend integration
- Заменить mock-данные по доменам.
- Добавить loading/error/empty states.
- Ввести feature flags для поэтапного cutover.
- Удалить mock-файлы после проверки.

### Phase D - Mobile integration
- Реализовать auth flow.
- Подключить patient self-service endpoints.
- Добавить offline queue/idempotency.
- Добавить сетевые/offline состояния.

### Phase E - Верификация
- Typecheck frontend/mobile.
- Integration/E2E тесты.
- Migration verify (upgrade -> downgrade -> upgrade).
- OpenAPI verify.
- Docker runtime smoke.

## 7. Критерии готовности к интеграции
- Backend tests: green.
- Migration head актуален и проверен.
- OpenAPI валиден и отражает изменения.
- Frontend/mobile typecheck проходит.
- Нет прямого использования mock-данных на интегрированных экранах.
- Auth flow работает end-to-end.
- Cross-clinic isolation покрыт тестами для ключевых endpoints.

## 8. Риски
- Большие UI-кодовые базы: риск регрессий при замене mock-данных.
- Расхождение mock-форм и backend DTO: нужна строгая типизация.
- Offline/mobile edge cases: нужны idempotency keys и retry.
- Diary CRUD-тесты отсутствуют: покрыть перед интеграцией diary-экранов.

## 9. Следующий шаг
Начать с Phase A: сгенерировать типы из OpenAPI и реализовать единый API-клиент для frontend и mobile, затем подключить auth flow. Backend hardening (Phase B) завершён за исключением diary CRUD-тестов.
