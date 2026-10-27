# PHASE 5 — PRODUCT REALITY CHECK

**Дата:** 2026-10-21  
**Автор:** Cline (AI coding agent)  
**Статус:** Итоговый отчёт ревью репозитория Clinical Compass  
**Место:** `clinicalcompass/docs/product/backend/reports/PHASE5_PRODUCT_REALITY_CHECK.md`

---

## 0. Executive Summary

| Контур | Статус | Критичность | Основной вывод |
|--------|--------|-------------|----------------|
| **Auth** | ✅ | P0 | Реализован полностью: регистрация, вход (email+пароль, телефон+SMS), JWT, refresh rotation, invite-код |
| **Patient** | ⚠️ | P0 | Роуты существуют, но **нет авторизации** (CurrentUser/DbSession не через Depends), PatientService — все заглушки (`pass`) |
| **Screening** | ❌ | P1 | Нет роутера, нет сервиса, нет моделей |
| **Diary** | ❌ | P1 | Нет роутера, нет сервиса, нет моделей |
| **Program** | ❌ | P1 | Нет роутера, нет сервиса, нет моделей |
| **Alert** | ❌ | P1 | Нет роутера, нет сервиса, нет моделей |
| **Medication** | ❌ | P1 | Нет роутера, нет сервиса, нет моделей |
| **Notification** | ❌ | P1 | Нет роутера, нет сервиса, нет моделей |
| **Admin** | ❌ | P1 | Нет роутера, нет сервиса, нет моделей |
| **Audit** | ❌ | P1 | Модель `audit_logs` есть в БД, но нет роутера, нет сервиса, нет API |

**Интеграция врача:** ❌ Не может: Login → Список пациентов → Карточка пациента (PatientService заглушки, нет auth на роутах)  
**Интеграция пациента:** ⚠️ Частично: Телефон → SMS → Invite Code реализованы на бэкенде; мобильный клиент имеет только экраны регистрации, но **нет вызовов API** (только health-check)

---

## 1. Source of Truth — Каталоги и файлы

| Путь | Назначение | Статус |
|------|------------|--------|
| `clinicalcompass/docs/product/backend/` | Документация + `reports/` | ✅ Существует |
| `SechHack_26/backend/` | Код бэкенда (FastAPI + SQLAlchemy + Alembic) | ✅ Существует |
| `SechHack_26/frontend/` | Фронтенд React Web | ⚠️ Только в ветке `frontend_dev`, не в основной ветке |
| `SechHack_26/backend/tests/` | Тесты бэкенда | ✅ Существуют |
| `C:/tmp/` | Временные скрипты диагностики | ✅ Существуют |

## 2. Figma Reality Check

### Figma MCP доступ

**Статус:** 🔴 Требуется аутентификация пользователя

Composio Figma toolkit connection был инициирован, но требует подтверждения пользователем:

[Connect Figma](https://connect.composio.dev/link/lk_txDfWEBHh52p)

Ссылка истекает через 10 минут после генерации. После прохождения аутентификации пользователь должен подтвердить, и мы сможем проверить:
- Веб-кабинет врача (Figma экраны)
- Мобильное приложение пациента (Figma экраны)

## 3. Frontend Reality Check (`frontend_dev` ветка)

### Структура исходников (`frontend/src/`)

```
app/
  App.tsx
  router.tsx
components/
  InvitePatientButton/
  admin/ (AdminSidebar, AdminTopBar)
  icons/ (NavIcons)
  sidebar/ (Sidebar, TopBar)
data/  ← ВСЕ МОК-ДАННЫЕ
  mockAdmin.ts
  mockAlerts.ts
  mockAnalytics.ts
  mockDoctor.ts
  mockExercises.ts
  mockMedications.ts
  mockMessages.ts
  mockPatientCard.ts
  mockPatients.ts
  mockPreVisitReport.ts
  mockTreatmentPlan.ts
layouts/ (AdminLayout, DoctorLayout)
pages/
  admin/ (AnalyticsPage, EmployeesPage, AdminPlaceholderPage)
  alerts/ (AlertsPage, AdverseEventAlertPage)
  dashboard/ (DashboardPage)
  exercises/ (ExercisesPage)
  medications/ (MedicationsPage)
  messages/ (MessagesPage)
  patient-card/ (PatientCardPage + DiaryChart widget)
  patients/ (PatientsPage)

## 4. Mobile Reality Check (`mobile_dev` ветка)

### Структура исходников (`mobile/src/`)

```
api/
  client.ts  ← Только getHealth, getDbHealth
components/
  CameraPermissionSheet.tsx
  CompassLogo.tsx
  OtpInput.tsx
  ScreenGradient.tsx
  StepProgress.tsx
  Toggle.tsx
screens/
  WelcomeScreen.tsx
  RegisterPhoneScreen.tsx   ← Телефон
  RegisterSmsScreen.tsx     ← SMS (OTP)
  RegisterConsentScreen.tsx ← Согласия
  RegisterDoctorScreen.tsx  ← Invite Code / Врач
  QrScanScreen.tsx          ← QR сканирование (expo-camera)
  ConsentDocumentScreen.tsx
theme/
  colors.ts
utils/
  phone.ts
```

### Сценарий регистрации пациента

**Телефон → SMS → Согласия → Invite Code → QR → Регистрация**

| Экран | Реализация | API вызов |

## 5. Backend Reality Check — Статусы по контурам

### Auth — ✅ (P0 — реализован)

| Эндпоинт | Метод | Путь | Реализован | Auth | RBAC |
|----------|-------|------|------------|------|------|
| Register | POST | /api/v1/auth/register | ✅ | Публичный | — |
| Login | POST | /api/v1/auth/login | ✅ | Публичный | — |
| SMS request | POST | /api/v1/auth/sms/request | ✅ | Публичный | — |
| SMS verify | POST | /api/v1/auth/sms/verify | ✅ | Публичный | — |
| Invite verify | POST | /api/v1/auth/invite/verify | ✅ | Требует JWT | CurrentUser |
| Refresh | POST | /api/v1/auth/refresh | ✅ | Публичный | — |
| Logout | POST | /api/v1/auth/logout | ✅ | Защищённый | CurrentUser |
| Me | GET | /api/v1/auth/me | ✅ | Защищённый | CurrentUser |
| Change password | POST | /api/v1/auth/change-password | ✅ | Защищённый | CurrentUser |

**Реализовано:** auth_service.py (полностью), jwt.py, passwords.py (Argon2id), sms_service.py, invite_service.py (полностью)

### Patient — ⚠️ (P0 — критические лусцы)

| Эндпоинт | Метод | Путь | Реализован | Auth | RBAC | Servicio |
|----------|-------|------|------------|------|------|----------|
| List patients | GET | /api/v1/patients | ⚠️ Маршрут есть | ❌ Нет Depends | ❌ Нет | ⚠️ Заглушка (`pass`) |
| Get patient | GET | /api/v1/patients/{id} | ⚠️ Маршрут есть | ❌ Нет Depends | ❌ Нет | ⚠️ Заглушка (`pass`) |
| Update patient | PATCH | /api/v1/patients/{id} | ⚠️ Маршрут есть | ❌ Нет Depends | ❌ Нет | ⚠️ Заглушка (`pass`) |
| Patient summary | GET | /api/v1/patients/{id}/summary | ⚠️ Маршрут есть | ❌ Нет Depends | ❌ Нет | ⚠️ Заглушка (`pass`) |

**Проблемы:**
1. `patients.py` роутер — параметры `current_user` и `db` **не обёрнуты в `Depends()`** → FastAPI не внедрит зависимости, auth и сессия не будут доступны
2. `PatientService` — все методы `list_patients`, `get_patient`, `update_patient`, `get_patient_summary` содержат только `pass`
3. Префикс роутера дублируется: в `router.py` роутер подключается с `prefix="/api/v1/patients"`, а сам роутер уже имеет `prefix="/api/v1/patients"` → итоговый путь `/api/v1/api/v1/patients`

**Реализовано в репозитории (но не подключено):** `patient_repository.py` — полная реализация с RBAC и clinic isolation; `patient_service.py` — заглушки

### Screening — ❌ (P1)

Нет роутера, нет сервиса, нет моделей, нет миграций. API_CONTRACTS.md §4 описывает эндпоинты, но кода нет.

### Diary — ❌ (P1)

Нет роутера, нет сервиса, нет моделей, нет миграций. API_CONTRACTS.md §5 описывает эндпоинты, но кода нет.

### Program — ❌ (P1)

Нет роутера, нет сервиса, нет моделей, нет миграций. API_CONTRACTS.md §6 описывает эндпоинты, но кода нет.

### Alert — ❌ (P1)

Нет роутера, нет сервиса, нет моделей, нет миграций. API_CONTRACTS.md §7 описывает эндпоинты, но кода нет.

### Medication — ❌ (P1)

## 6. API Contract Validation

### Сравнение API_CONTRACTs.md с реальными роутерами

| Раздел документа | Эндпоинты в документе | Реализовано в коде | Статус |
|-----------------|----------------------|-------------------|--------|
| §1 Конверт ответа | — | ✅ `response.py` `envelope()` | ✅ |
| §2 Auth | 9 эндпоинтов | ✅ Все 9 реализованы | ✅ |
| §3 Practitioners / invite-коды | 2 эндпоинта | ✅ Оба реализованы | ✅ |
| §4 Screening | 4 эндпоинта | ❌ Ни одного | ❌ |
| §5 Diary | 6 эндпоинтов | ❌ Ни одного | ❌ |
| §6 Program | 4 эндпоинта | ❌ Ни одного | ❌ |
| §7 Alerts | 5 эндпоинтов | ❌ Ни одного | ❌ |
| §7 Medications | 6 эндпоинтов | ❌ Ни одного | ❌ |
| §9 Appointments | 2 эндпоинта | ❌ Ни одного | ❌ |
| §9 Messages | 3 эндпоинта | ❌ Ни одного | ❌ |
| §10 Notifications | 2 эндпоинта | ❌ Ни одного | ❌ |
| §11 Reports | 2 эндпоинта | ❌ Ни одного | ❌ |
| §12 Admin | 5 эндпоинтов | ❌ Ни одного | ❌ |
| §13 Audit | 2 эндпоинта | ❌ Ни одного | ❌ |
| Health | /health, /db/health, /api/v1/health | ✅ Все реализованы | ✅ |

### Критические расхождения с API_CONTRACTS.md

1. **Префикс роутера Patienten:** В `router.py` строка 10:
   ```python
   api_router.include_router(patients.router, prefix="/api/v1/patients", tags=["patients"])
   ```
   Но `patients.router` уже имеет `prefix="/api/v1/patients"` (строка 10 patients.py). Результат: `/api/v1/api/v1/patients` — путь не совпадает с контрактом.

2. **Отсутствие auth на пациентских роутах:** Параметры `current_user` и `db` в `patients.py` не используют `Depends()` — авторизация и сессия БД не внедряются.

3. **PatientService — заглушки:** Все 4 метода содержат только `pass`. Реальная логика в `patient_repository.py`, но сервисный слой не реализован.

## 7. Integration Readiness

### Может ли врач: Login → Список пациентов → Карточка пациента?

| Шаг | Возможно | Примечание |
|-----|---------|------------|
| Login (email+пароль) | ✅ | `/api/v1/auth/login` реализован |
| Получить токен JWT | ✅ | Возвращается access + refresh |
| Список пациентов (`GET /api/v1/patients`) | ❌ | Маршрут сломан (двойной префикс), нет auth, PatientService — заглушка |
| Карточка пациента (`GET /api/v1/patients/{id}`) | ❌ | Те же проблемы |

**Итог: ❌ НЕ МОЖЕТ.** Врач не может получить список пациентов или карточку пациента через API.

### Может ли пациент: Телефон → SMS → Invite Code → Приложение?

| Шаг | Возможно | Примечание |
|-----|---------|------------|
| Ввод телефона (мобилка) | ✅ | Экран RegisterPhoneScreen реализован |
| Запрос SMS (`POST /api/v1/auth/sms/request`) | ✅ | Бэкенд реализован, но **мобилка не вызывает API** |
| Проверка SMS (`POST /api/v1/auth/sms/verify`) | ✅ | Бэкенд реализован, но **мобилка не вызывает API** |
| Получение JWT токенов | ✅ | Бэкенд возвращает токены, но мобилка не сохраняет их |
| Ввод invite-кода | ✅ | Экран RegisterDoctorScreen реализован |
| Проверка invite-кода (`POST /api/v1/auth/invite/verify`) | ✅ | Бэкенд реализован, но **мобилка не вызывает API** |
| QR сканирование | ✅ | Экран QrScanScreen реализован (expo-camera), извлечение кода клиентом |
| Работа в приложении после регистрации | ❌ | Нет API вызовов для получения данных пациента |

**Итог: ⚠️ ЧАСТИЧНО.** Бэкенд поддерживает весь флоу регистрации пациента, но мобильный клиент не делает реальных API вызовов — только UI экраны.

---

4. **Отсутствуют 14 из 16 разделов API:** Только Auth (§2), Practitioners (§3) и Health реализованы.

---

## 8. Documentation Drift

Сравнение каждого документа с кодом:

| Документ | Состояние | Основные расхождения |
|----------|-----------|---------------------|
| `API_CONTRACTS.md` | ⚠️ Дрейф | Описывает 16 разделов API, реализовано только Auth, Practitioners, Health. Пациентские эндпоинты сломаны (двойной префикс, нет auth). |
| `AUTH_PLAN.md` | ✅ Актуально | JWT схема, SMS, invite-код, RBAC матрица — соответствуют коду. |
| `MODULES.md` | ⚠️ Дрейф | Описывает 8 модулей, но реализованы только auth-service и частично patient-service (репозиторий без сервиса). |
| `DB_SCHEMA.md` | ✅ Актуально | Миграция `0001_auth_base.py` соответствует описанию таблиц. |
| `MEDICATIONS.md` | ⚠️ Дрейф | Описывает medication-service, но кода нет. |
| `TESTS.md` | ✅ Актуально | Тесты существуют для health и invite-кода. |
| `TASKS.md` | ⚠️ Дрейф | Описывает задачи, многие не выполнены. |
| `ARCHITECTURE.md` | ⚠️ Дрейф | Описывает архитектуру, но многие модули не реализованы. |

## 9. Priorities

### P0 — Блокирует интеграцию (необходимо исправить до cualquier интеграции)

| # | Проблема | Контур | Описание |
|---|----------|--------|----------|
| P0-1 | PatientService — заглушки | Patient | Все 4 метода в `patient_service.py` содержат только `pass`. Нужно реализовать бизнес-логику поверх `PatientRepository`. |
| P0-2 | Нет auth на роутах пациентов | Patient | Параметры `current_user` и `db` в `patients.py` не обёрнуты в `Depends()`. Нужен `CurrentUser`, `DbSession`, `require_roles` / `require_permission`. |
| P0-3 | Двойной префикс роутера Patienten | Patient | `router.py` добавляет `prefix="/api/v1/patients"` к роутеру, который уже имеет тот же префикс. Путь становится `/api/v1/api/v1/patients`. |
| P0-4 | Мобилка не вызывает API | Mobile | `src/api/client.ts` содержит только `getHealth` и `getDbHealth`. Нужны функции для SMS, invite-кода, получения данных пациента. |
| P0-5 | Фронтенд использует только мок-данные | Frontend | Все страницы берут данные из `data/mock*.ts`. Нет реальных API вызовов. |

### P1 — Нужно до MVP (функциональные модули)

| # | Модуль | Описание |
|---|--------|----------|
| P1-1 | Screening | Роутер, сервис, модели для PHQ-9/GAD-7 опросников |
| P1-2 | Diary | Роутер, сервис, модели для дневника самооценки |
| P1-3 | Program | Роутер, сервис, модели для программ лечения |
| P1-4 | Alert | Роутер, сервис, модели для алертов |
| P1-5 | Medication | Роутер, сервис, модели для лекарств и рецептов |
| P1-6 | Notification | Роутер, сервис, модели для уведомлений и сообщений |
| P1-7 | Admin | Роутер, сервис, модели для администрирования |
| P1-8 | Audit | Роутер и API для просмотра аудит-логов (модель и сервис уже есть) |

### P2 — Можно отложить

| # | Проблема | Описание |
|---|----------|----------|
| P2-1 | Figma проверка | Требуется аутентификация пользователя в Composio Figma toolkit |
| P2-2 | 2FA/MFA | Отложено до pós-MVP (AUTH_PLAN.md §10) |

## 10. Итоговый отчёт

### Ключевые выводы

1. **Auth контур полностью реализован** — регистрация, вход (email+пароль и телефон+SMS), JWT, refresh rotation, invite-код. Это основа для интеграции.

2. **Patient контур сломан на уровне интеграции** — роуты существуют, но нет авторизации (Depends не используется), PatientService — заглушки, двойной префикс в router.py. Врач не может получить список пациентов.

3. **Мобильный клиент не делает API вызовов** — все экраны регистрации реализованы UI, но `api/client.ts` содержит только health-check. Бэкенд готов к приёму вызовов, клиент не отправляет их.

4. **14 из 16 разделов API_CONTRACTS.md не реализованы** — только Auth, Practitioners и Health имеют код. Screening, Diary, Program, Alert, Medication, Notification, Admin, Audit — отсутствуют полностью.

5. **Фронтенд использует только мок-данные** — нет реального API клиента, все страницы берут данные из `data/mock*.ts`.

### Рекомендации по действиям (в порядке приоритета)

1. **Исправить patients.py роутер:** добавить `Depends(CurrentUser)`, `Depends(DbSession)`, `require_roles` / `require_permission` там, где нужно.
2. **Исправить router.py:** убрать дублирующий prefix при подключении patients.router.
3. **Реализовать PatientService:** перенести логику из `patient_repository.py` в сервисные методы.
4. **Реализовать API клиент мобильного приложения:** функции для SMS request/verify, invite verify, получения профиля пациента.
5. **Реализовать API клиент фронтенда:** заменить мок-данные на реальные вызовы к бэкенду.
6. **Реализовать отсутствующие модули:** Screening, Diary, Program, Alert, Medication, Notification, Admin, Audit.

### Figma MCP

Соединение с Figma через Composio инициировано, но требует аутентификации пользователя по ссылке:
[Connect Figma](https://connect.composio.dev/link/lk_txDfWEBHh52p)

После подтверждения пользователем можно будет проверить Figma экраны веб-кабинета врача и мобильного приложения пациента.

---

## Приложение А: Файлы, просмотренные в ходе ревью

### Бэкенд
- `SechHack_26/backend/app/main.py` — точка входа FastAPI
- `SechHack_26/backend/app/api/v1/router.py` — агрегатор роутеров (ЕСТЬ баг с двойным префиксом)
- `SechHack_26/backend/app/api/v1/auth.py` — auth эндпоинты (полностью реализованы)
- `SechHack_26/backend/app/api/v1/patients.py` — patient эндпоинты (нет auth, сервис — заглушка)
- `SechHack_26/backend/app/api/v1/practitioners.py` — invite-коды (реализованы)
- `SechHack_26/backend/app/api/v1/health.py` — health-check (реализовано)
- `SechHack_26/backend/app/api/dependencies.py` — JWT, RBAC зависимости
- `SechHack_26/backend/app/core/permissions.py` — RBAC матрица прав
- `SechHack_26/backend/app/core/response.py` — конверт ответа {data, meta, error}
- `SechHack_26/backend/app/core/errors.py` — доменные ошибки API
- `SechHack_26/backend/app/core/config.py` — настройки (порт 3001, CORS, JWT)
- `SechHack_26/backend/app/core/security/jwt.py` — JWT токены HS256
- `SechHack_26/backend/app/core/security/passwords.py` — Argon2id хеширование
- `SechHack_26/backend/app/services/auth_service.py` — сервис аутентификации (полный)
- `SechHack_26/backend/app/services/patient_service.py` — **все методы — `pass`**
- `SechHack_26/backend/app/services/invite_service.py` — сервис invite-кодов (полный)
- `SechHack_26/backend/app/repositories/patient_repository.py` — репозиторий пациентов (полный, с RBAC)
- `SechHack_26/backend/app/models/user.py` — модель пользователя
- `SechHack_26/backend/app/models/profile.py` — профили пациента/специалиста/назначения
- `SechHack_26/backend/app/schemas/patient.py` — схемы пациента
- `SechHack_26/backend/app/schemas/auth.py` — схемы аутентификации
- `SechHack_26/backend/alembic/versions/0001_auth_base.py` — миграция БД (таблицы users, clinics, patient_profiles, practitioner_profiles, refresh_tokens, sms_codes, invite_codes, patient_assignments, audit_logs)
- `SechHack_26/backend/tests/api/test_health.py` — тесты health-check
- `SechHack_26/backend/tests/conftest.py` — фикстуры pytest

### Фронтенд (ветка frontend_dev)
- `frontend/src/pages/patients/PatientsPage.tsx` — использует mockPatients
- `frontend/src/pages/patient-card/PatientCardPage.tsx` — использует mockPatientCard
- `frontend/src/data/mockPatients.ts` — мок данные пациентов
- `frontend/src/data/mockPatientCard.ts` — мок карточки пациента
- `frontend/src/types/doctor.ts` — типы NavItemId, AlertPriority, AlertQueueTab, AlertRiskLevel
- `frontend/src/components/InvitePatientButton/` — компонент приглашения пациента

### Мобильный клиент (ветка mobile_dev)
- `mobile/src/api/client.ts` — только getHealth, getDbHealth
- `mobile/src/screens/RegisterPhoneScreen.tsx` — экран телефона
- `mobile/src/screens/RegisterSmsScreen.tsx` — экран SMS/OTP
- `mobile/src/screens/RegisterConsentScreen.tsx` — экран согласий
- `mobile/src/screens/RegisterDoctorScreen.tsx` — экран invite-кода/врача
- `mobile/src/screens/QrScanScreen.tsx` — экран QR сканирования (expo-camera)
- `mobile/src/screens/WelcomeScreen.tsx` — экран приветствия

### Документация
- `clinicalcompass/docs/product/backend/API_CONTRACTS.md` — API контракты
- `clinicalcompass/docs/product/backend/AUTH_PLAN.md` — план аутентификации и RBAC
- `clinicalcompass/docs/product/backend/MODULES.md` — модули MVP
| P2-3 | Сброс пароля по email | Отложено (админ сбрасывает через admin-service) |
| P2-4 | Реальные SMS (прод) | В dev — заглушка (код в лог) |

---

---

Нет роутера, нет сервиса, нет моделей, нет миграций. API_CONTRACTS.md §7 описывает эндпоинты, но кода нет.

### Notification — ❌ (P1)

Нет роутера, нет сервиса, нет моделей, нет миграций. API_CONTRACTS.md §10 описывает эндпоинты, но кода нет.

### Admin — ❌ (P1)

Нет роутера, нет сервиса, нет моделей, нет миграций. API_CONTRACTS.md §12 описывает эндпоинты, но кода нет.

### Audit — ❌ (P1)

Модель `audit_logs` есть в миграции `0001_auth_base.py`, сервис `audit_service.py` существует (используется auth_service и invite_service), но **нет роутера и нет API** для просмотра логов.

---
|-------|-----------|-----------|
| WelcomeScreen | ✅ UI реализован | Нет |
| RegisterPhoneScreen | ✅ UI реализован (текстовое поле телефона) | Нет — только UI |
| RegisterSmsScreen | ✅ UI реализован (OtpInput) | Нет — только UI |
| RegisterConsentScreen | ✅ UI реализован | Нет |
| RegisterDoctorScreen | ✅ UI реализован (поле invite-кода) | Нет — только UI |
| QrScanScreen | ✅ expo-camera, сканирование QR | Нет — только клиентское извлечение кода |

### API клиент мобильного приложения

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

export async function getHealth()  // → GET /health
export async function getDbHealth() // → GET /db/health
```

**Только health-check.** Нет функций для:
- Запроса SMS-кода (`POST /api/v1/auth/sms/request`)
- Проверки SMS-кода (`POST /api/v1/auth/sms/verify`)
- Проверки invite-кода (`POST /api/v1/auth/invite/verify`)
- Входа/получения токенов

---
  pre-visit-report/ (PreVisitReportPage)
  treatment-plan/ (TreatmentPlanPage)
  PlaceholderPage.tsx
types/
  admin.ts
  doctor.ts
```

### Ключевые находки

| Аспект | Наблюдение | Оценка |
|--------|-----------|--------|
| **API клиент** | Не найден (`api/client.ts` отсутствует) | ❌ Критично |
| **Реальные API вызовы** | Нет — все данные из `data/mock*.ts` | ❌ Критично |
| **Пациенты список** | `PatientsPage.tsx` использует `patients` из `mockPatients.ts` | Mock |
| **Карточка пациента** | `PatientCardPage.tsx` использует `getPatientCard()` из `mockPatientCard.ts` | Mock |
| **Типы** | `types/doctor.ts` определяет `NavItemId`, `AlertPriority`, `AlertQueueTab`, `AlertRiskLevel` | Ок |
| **CORS origen** | `http://localhost:5173` в бэкенд config | Ок |
| **InvitePatientButton** | Компонент существует, но неясно, вызывает ли реальный API | ⚠️ Требует проверки |

### Mock-файлы и жёстко заданные данные

- `mockPatients.ts` — 24 пациента, фильтры: all/critical/attention/stable/aviandr
- `mockPatientCard.ts` — референс карточки "Миронова Анна Викторовна" (id: p1, возраст 34, диагноз "ГТР (F41.1)")
- `mockMedications.ts`, `mockAlerts.ts`, `mockMessages.ts` и др. — все мок

---

### Что требуется проверить в Figma (когда соединение будет активным)

Для каждого экрана определить:
1. Какие данные отображаются
2. Какие действия доступны
3. Какие API требуются экрану

---
