# PHASE 6 — CODE VERIFICATION REPORT

**Дата:** 2026-10-21
**Ветка:** `backend_dev` (`SechHack_26`)
**Источник истины:** реальный код > Figma > документация > отчёты

---

## 1. Verified Findings

- Backend FastAPI приложение существует в `SechHack_26/backend/app/main.py`; подключает `api_router` из `app/api/v1/router.py`.
- Реально реализованы и подключены роутеры только: `health`, `auth`, `practitioners`, `patients` (`app/api/v1/router.py`, строки 8–11).
- Auth-контур реализован в `app/api/v1/auth.py` и `app/services/auth_service.py`, `sms_service.py`, `invite_service.py`: register/login, SMS request/verify, invite verify, refresh, logout, me, change-password.
- `app/api/v1/patients.py` содержит 4 endpoint'а, но все вызывают методы `PatientService`, которые являются заглушками `pass` (`app/services/patient_service.py`, строки 28/37/47/56).
- Параметры роутов пациентов объявлены без аннотаций зависимостей: `current_user`, `db` без `Depends(...)` (`app/api/v1/patients.py`, строки 22–23, 38–39, 55–56, 71–72).
- Двойной prefix для patients: `patients.router` уже имеет `prefix="/api/v1/patients"` (`app/api/v1/patients.py`, строка 10), а `router.py` дополнительно вызывает `include_router(patients.router, prefix="/api/v1/patients", ...)` (`app/api/v1/router.py`, строка 11).
- Backend не импортируется из-за синтаксической ошибки в `app/models/profile.py`: незакрытая тройная строка docstring в классе `PatientAssignment`, вложенном в `PractitionerProfile` (строки 80–96). `python -m compileall app` завершается с `SyntaxError`.
- `PatientAssignment` объявлен дважды: корректно в `app/models/assignment.py` и сломанно в `app/models/profile.py`.
- Frontend (`frontend_dev`) состоит из страниц на мок-данных (`src/data/mock*.ts`), реальных API-вызовов не найдено.
- Mobile (`mobile_dev`) содержит экраны регистрации, но `src/api/client.ts` реализует только `/health` и `/db/health`; вызовов auth/patient API нет.

---

## 2. Refuted Findings

- **PHASE4_PATIENT_SERVICE_REPORT.md утверждает, что Patient Service "COMPLETE" и "service layer orchestrates".**
  - **❌ REFUTED** — `app/services/patient_service.py` содержит только `pass` во всех 4 методах (строки 28, 37, 47, 56). Service layer не выполняет бизнес-логику.
- **PHASE4 утверждает, что router корректно использует зависимости.**
  - **❌ REFUTED** — в `app/api/v1/patients.py` параметры `current_user`, `db` не имеют `Depends(CurrentUser)` / `Depends(DbSession)`. FastAPI не внедрит зависимости автоматически без аннотаций.
- **PHASE4 утверждает, что `app/api/v1/router.py` корректно подключает patients router.**
  - **⚠️ Частично REFUTED** — подключение есть, но с двойным prefix, что приводит к неверным путям `/api/v1/patients/api/v1/patients`.
- **PHASE5 утверждает, что Auth "реализован полностью".**
  - **✅ CONFIRMED** — код `auth.py`, `auth_service.py`, `sms_service.py`, `invite_service.py` реализует описанные endpoint'ы, но backend не стартует из-за синтаксической ошибки `profile.py`, поэтому фактически auth недоступен в runtime.
- **PHASE5 утверждает, что Patient Service "роуты существуют, но нет авторизации".**
  - **✅ CONFIRMED** — роуты есть, зависимости не объявлены. Дополнительно service — заглушки.

---

## 3. Backend Status

| Модуль | Статус | Доказательство |
|---|---|---|
| auth-service | ⚠️ Частично реализован | Код есть, но runtime заблокирован синтаксической ошибкой `profile.py` |
| patient-service | ⚠️ Частично реализован | Роуты и repository есть, service — `pass`, auth не подключена |
| screening-service | ❌ Отсутствует | Нет router/service/models в `app/` |
| diary-service | ❌ Отсутствует | Нет router/service/models в `app/` |
| program-service | ❌ Отсутствует | Нет router/service/models в `app/` |
| alert-service | ❌ Отсутствует | Нет router/service/models в `app/` |
| medication-service | ❌ Отсутствует | Нет router/service/models в `app/` |
| notification-service | ❌ Отсутствует | Нет router/service/models в `app/` |
| admin-service | ❌ Отсутствует | Нет router/service/models в `app/` |
| audit-service | ⚠️ Частично реализован | `audit_service.py` существует и используется, но нет API/router |
| report-service | ❌ Отсутствует | Нет router/service/models в `app/` |

## 4. Frontend Status

- Все страницы в `frontend_dev/frontend/src/pages/*` используют мок-данные из `src/data/mock*.ts`.
- Реальных API-вызовов в `src/` не найдено (`fetch`/`axios` отсутствуют).
- Страницы готовы только как UI-прототип; к реальному backend не подключены.

---

## 5. Mobile Status

Сценарий `Телефон → SMS → Согласия → Invite Code → QR → Регистрация → Работа`:

| Шаг | Статус | Доказательство |
|---|---|---|
| Телефон | ⚠️ Частично | UI есть (`RegisterPhoneScreen`), API-вызовов нет |
| SMS | ⚠️ Частично | UI есть (`RegisterSmsScreen`), API-вызовов нет |
| Согласия | ⚠️ Частично | UI есть (`RegisterConsentScreen`), API-вызовов нет |
| Invite Code | ⚠️ Частично | UI есть (`RegisterDoctorScreen`), API-вызовов нет |
| QR | ⚠️ Частично | `QrScanScreen` использует expo-camera, но извлечённый код не отправляется на backend |
| Регистрация | ⚠️ Частично | Backend endpoint'ы существуют, но mobile client их не вызывает |
| Работа в приложении | ❌ Не реализовано | `src/api/client.ts` реализует только `/health`, `/db/health` |

---

## 6. Figma Status

- Figma MCP обнаружен, но токен вернул `401 Invalid token` при запросе metadata файла `sge8zDLWQRdqkJQ8BwwY3O`.
- Следовательно, проверка экранов через Figma в рамках этого прогона **не выполнена**.
- Найденная ссылка на дизайн: `https://www.figma.com/design/sge8zDLWQRdqkJQ8BwwY3O/...` (из `docs/ChatExport_2026-10-20/messages.html`).

---

## 7. API Contract Status

Сравнение `API_CONTRACTS.md` с реальными FastAPI роутами:

| Endpoint (контракт) | Статус |
|---|---|
| `POST /api/v1/auth/register` | ✅ Реализован |
| `POST /api/v1/auth/login` | ✅ Реализован |
| `POST /api/v1/auth/sms/request` | ✅ Реализован |
| `POST /api/v1/auth/sms/verify` | ✅ Реализован |
| `POST /api/v1/auth/invite/verify` | ✅ Реализован |
| `POST /api/v1/auth/refresh` | ✅ Реализован |
| `POST /api/v1/auth/logout` | ✅ Реализован |
| `GET /api/v1/auth/me` | ✅ Реализован |
| `POST /api/v1/auth/change-password` | ✅ Реализован |
| `GET /api/v1/patients` | ⚠️ Роут есть, но service — `pass`, auth не подключена, путь дублируется |
| `GET /api/v1/patients/{id}` | ⚠️ Роут есть, но service — `pass` |
| `PATCH /api/v1/patients/{id}` | ⚠️ Роут есть, но service — `pass` |
| `GET /api/v1/patients/{id}/summary` | ⚠️ Роут есть, но service — `pass` |
| `GET /api/v1/practitioners/{id}/invite-codes` | ✅ Реализован |
| `POST /api/v1/practitioners/{id}/invite-codes` | ✅ Реализован |
| Все остальные endpoint'ы контракта (screenings, diary, appointments, medications, alerts, notifications, reports, admin, audit) | ❌ Отсутствуют в коде |

---

## 8. Documentation Drift

- `PHASE4_PATIENT_SERVICE_REPORT.md` описывает Patient Service как завершённый, но код содержит заглушки `pass`. **Документация устарела/некорректна относительно кода.**
- `API_CONTRACTS.md` описывает множество сервисов (screening, diary, medications и т.д.), которых нет в коде. **Документация описывает будущее состояние, код отсутствует.**
- `app/models/profile.py` содержит вложенный класс `PatientAssignment` с незакрытой docstring, что противоречит `app/models/assignment.py`. **Код не соответствует самому себе.**

---

## 9. Confirmed Blockers

1. `SyntaxError` в `app/models/profile.py` блокирует импорт backend и запуск тестов.
2. Пациентские роуты не имеют `Depends(CurrentUser)` / `Depends(DbSession)`.
3. `PatientService` — заглушки `pass`.
4. Двойной prefix `/api/v1/patients` ломает маршруты.
5. Frontend и mobile не вызывают backend API.

---

## 10. P0 / P1 / P2 Priorities

- **P0:** Исправить синтаксическую ошибку `profile.py`; подключить зависимости в patients router; реализовать `PatientService`/repository методы; убрать двойной prefix.
- **P1:** Подключить frontend/mobile к реальному API; реализовать недостающие модули по контракту.
- **P2:** Обновить документацию и отчёты под фактическое состояние; восстановить доступ к Figma.

---

## 11. Recommended Fixes

- Удалить или исправить вложенный `PatientAssignment` в `app/models/profile.py`; использовать `app/models/assignment.py`.
- Добавить аннотации `CurrentUser`, `DbSession` в `app/api/v1/patients.py`.
- Реализовать методы `PatientService` и недостающие repository-методы.
- Убрать дублирующий prefix в `app/api/v1/router.py`.
- Добавить API-клиент в mobile и frontend.

---

## 12. Recommended Next Phase

- Phase 7: Technical stabilization (fix blockers, make backend importable and runnable, minimal integration tests for auth + patients).
- После этого — Phase 8: реализация недостающих сервисов по приоритету.
