# Client Integration Plan — Frontend (web) + Mobile

> Документ ведётся в процессе подключения клиентов (React+Vite web, React Native+Expo mobile) к реальному backend API.
> Источник истины по контрактам: `SechHack_26/backend` (код + миграции + `GET /openapi.json`), `docs/BACKEND_SPEC.md`, `docs/CLIENT_MAPPING.md`.

**Статус:** Backend готов (миграции head `0036_rls_multi_clinic`, 164 теста зелёные, OpenAPI 90 путей/56 схем). Клиенты пока на mock/UI-only: frontend 37 mock-файлов, 0 реальных вызовов; mobile API-клиент содержит только `getHealth`/`getDbHealth`.

---

## 1. Обзор архитектуры

```
┌─────────────────────┐     HTTPS/JSON     ┌──────────────────────┐
│ Mobile (Expo RN)    │ ─────────────────▶ │ FastAPI backend      │
│ phone+SMS auth      │                    │ /api/v1/*            │
└─────────────────────┘                    │ PostgreSQL + RLS     │
┌─────────────────────┐     HTTPS/JSON     │                      │
│ Web (React+Vite)    │ ─────────────────▶ │ JWT access/refresh   │
│ email+password auth │                    └──────────────────────┘
└─────────────────────┘
```

- Базовый URL backend: `http://localhost:3001` (dev). Мобилка: `EXPO_PUBLIC_API_URL`.
- Фронт: пока нет `.env`; предлагаю `VITE_API_URL` (см. раздел 4).
- Все ответы в стандартной обёртке `{ data, meta, error }`.

---

## 2. Анализ кодовой базы клиентов

### 2.1 Frontend (`frontend_dev/frontend`)
- Стек: React 19, Vite 8, TypeScript 6, react-router-dom 7, sass, @hugeicons.
- Точек входа: `src/main.tsx`, `src/app/App.tsx`, `src/app/router.tsx`.
- Auth: `src/lib/doctorAuth.ts` — **mock** (localStorage флаг `kk-doctor-auth`, демо-логин `e.smirnova@ravnovesie.ru / Clinica2026`). Нет JWT, нет refresh.
- Данные: `src/data/mock*.ts` (37 файлов) — все экраны читают моки.
- API-слой: **отсутствует** (нет fetch/axios к backend).
- Типы: `src/types/admin.ts`, `src/types/doctor.ts`.

### 2.2 Mobile (`mobile_dev/mobile`)
- Стек: Expo SDK 57, React Native 0.86, React 19, TS 6.
- Точек входа: `index.ts`, `App.tsx`.
- API-клиент: `src/api/client.ts` + `src/api/auth.ts` (sms request/verify, invite verify, consent, /auth/me, refresh/logout), `src/api/storage.ts` (SecureStore tokens); автологин при старте через `/auth/me`.
- Экраны: 40+ (`src/screens/*`), включая регистрацию phone→SMS→consent→invite/QR.
- Данные: `src/data/questionnaires.ts` (мок).
- Hooks: `src/hooks/useNetworkStatus.ts`.

### 2.3 Общий вывод
Главный блокер интеграции — отсутствие клиентского API-слоя, типов DTO, auth-token lifecycle и замены mock-данных. Backend-долгов по контрактам нет (~95% покрытие).

---

## 3. Контракты backend (кратко)

- Префикс: `/api/v1`.
- Auth:
  - Mobile: `POST /api/v1/auth/sms/request`, `/auth/sms/verify`, `/auth/invite/verify`, `/auth/refresh`, `/auth/logout`.
  - Web: `POST /api/v1/auth/login` (email+password), `/auth/refresh`, `/auth/logout`.
- Стандартный envelope: `{ data, meta, error }`.
- JWT: access 15 мин, refresh 7 дней (rotation).
- RBAC: роли doctor/psychologist/coordinator/admin/superadmin/patient.
- OpenAPI: `docs/openapi.json` (90 путей). Использовать как источник типов (генерация через `openapi-typescript` — опционально, требует согласования).
---

## 4. Окружение и запуск

### 4.1 Backend
```bash
cd SechHack_26/backend
python -m venv .venv          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
```
Проверка: `GET http://localhost:3001/health`, `GET /openapi.json`.

### 4.2 Frontend (React+Vite) — **без Python venv**
Фронтенд работает на Node.js, Python-окружение не нужно.
```bash
cd frontend_dev/frontend
npm install
# создать .env (или .env.local):
# VITE_API_URL=http://localhost:3001
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build
npm run lint         # oxlint
```

### 4.3 Mobile (Expo) — **без Python venv**
```bash
cd mobile_dev/mobile
npm install
# .env.example уже есть: EXPO_PUBLIC_API_URL=http://localhost:3001
npx expo start       # Metro bundler
npx expo start --android   # Android эмулятор (10.0.2.2:3001)
npx expo start --ios       # iOS симулятор (только macOS)
npx expo start --web       # web-превью
```

---

## 5. Shared API client layer (план реализации)

Создать в обоих клиентах модуль `src/api/`:

### 5.1 Структура
```
src/api/
  client.ts        # fetch wrapper: baseURL, headers, envelope unwrap, 401→refresh
  auth.ts          # login/sms/verify/refresh/logout + token storage
  types.ts         # DTO (или генерация из OpenAPI)
  endpoints/       # patients, diary, questionnaires, medications, chat, home...
```

### 5.2 Токены
- Хранение: mobile → `expo-secure-store` (или AsyncStorage для MVP); web → `localStorage`/`sessionStorage` (access в памяти предпочтительно, refresh в httpOnly cookie недоступен — хранить в localStorage, осознавая XSS-риск; для MVP допустимо).
- Авто-refresh при 401: один запрос refresh, очередь ожидающих.
- Logout: очистка токенов + редирект на логин.

### 5.3 Envelope
```ts
type ApiEnvelope<T> = { data: T; meta?: any; error?: { code: string; message: string } };
async function request<T>(path, init): Promise<T> {
  const res = await fetch(baseURL + path, init);
  const json = await res.json() as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new ApiError(json.error ?? { code: 'HTTP', message: res.statusText });
  return json.data;
}
```

### 5.4 Интерсепторы
- Добавлять `Authorization: Bearer <access>` если есть.
- Логировать ошибки (dev).
- Обработка 401 → refresh → retry один раз.

---

## 6. Auth-флоу

### Mobile (phone+SMS)
1. `RegisterPhoneScreen` → `POST /auth/sms/request { phone }`.
2. `RegisterSmsScreen` → `POST /auth/sms/verify { phone, code }` → получить токены + user.
3. `RegisterConsentScreen` → (при необходимости) `POST /auth/consent` (если эндпоинт есть; иначе пропуск).
4. `RegisterDoctorScreen`/`QrScanScreen` → `POST /auth/invite/verify { code }` (код без дефиса).
5. Skip → завершение регистрации без привязки; привязка позже через тот же эндпоинт.

### Web (email+password)
1. `LoginPage` → `POST /auth/login { email, password }`.
2. Сохранить токены; редирект в кабинет.
3. `RequireDoctorAuth` → проверка access; при отсутствии → `/login`.

---

## 7. План миграции по экранам (приоритет)

1. **Auth** (mobile registration + web login) — разблокирует всё остальное.
2. **Home/Dashboard** — агрегированный endpoint `/home` (проверить в OpenAPI; иначе несколько запросов).
3. **Patients** — список (search param), карточка пациента (N+1 исправлен).
4. **Diary** — CRUD записей, summary.
5. **Questionnaires** — список, назначение, прохождение, результаты.
6. **Medications** — назначения, приём, приверженность.
7. **Chat/Messages**.
8. **Admin** — сотрудники, клиника, аудит.

На каждом шаге: заменить mock-импорт на хук `useXxx()` → API; удалить/пометить mock-файл; типы из OpenAPI.

---

## 8. Тестирование

### 8.1 Уровни
- **Unit**: чистые функции (форматирование телефона, парсинг, DTO-мапперы). Фронтенд: добавить `vitest` (требует согласования; сейчас нет раннера). Мобилка: `jest` (входит в Expo) — `npx jest`.
- **Integration**: компоненты с моком API (MSW — добавить при согласовании).
- **API contract**: сравнение DTO с OpenAPI (ручное + `openapi-typescript`).
- **E2E**: web — Playwright (добавить); mobile — Maestro/Detox (требует нативной сборки).

### 8.2 Эмуляция / запуск приложений
- **Web**: `npm run dev` → браузер `http://localhost:5173`. Достаточно для разработки и ручного тестирования.
- **Mobile (Expo Go)**: установить приложение Expo Go на физическое устройство или эмулятор; `npx expo start` → сканировать QR. Быстрый цикл, без сборки APK.
- **Android эмулятор**: Android Studio → Virtual Device (Pixel). Запуск `npx expo start --android`. Backend доступен по `http://10.0.2.2:3001`.
- **iOS симулятор**: только на macOS: `npx expo start --ios`.
- **Expo Orbit**: десктопное приложение (macOS/Windows) для запуска сборок на симуляторах/устройствах, просмотра логов, управления builds. Удобно для EAS-сборок; не обязателен для dev через Expo Go.

### 8.3 Сборка APK / IPA
- **В конце интеграции** (или по этапам для smoke-теста на устройстве) — через EAS:
  ```bash
  npm install -g eas-cli
  eas login
  eas build --platform android --profile preview   # APK (internal)
  eas build --platform android --profile production # AAB
  ```
- Локальная сборка APK возможна (`npx expo run:android`) при установленном Android SDK/Gradle — тяжелее, но быстрее для итераций без облака.
- **Через код** (Expo Go) достаточно для большинства проверок UI/логики; нативные модули (камера QR) требуют dev-client: `eas build --profile development` или `npx expo run:android`.

### 8.4 Чек-лист smoke-теста (mobile)
- Регистрация: phone → SMS → consent → invite/QR → готово.
- Вход повторный (токен persisted).
- Home загружается с реальными данными.
- Создание записи дневника.
- Прохождение PHQ-9/GAD-7.
- Сканирование QR (требует dev-client/физ. устройство).

### 8.5 Чек-лист smoke-теста (web)
- Логин email+password.
- Dashboard.
- Список/карточка пациента, поиск.
- Назначение опросника.
- Админка (сотрудники).

---

## 9. Безопасность и хранение секретов
- Не коммитить `.env`, токены, ключи. Только `.env.example`.
- Токены в mobile — SecureStore; в web — localStorage (MVP). Переход на httpOnly cookie — после согласования с backend (нужны CORS/cookie настройки).
- Все запросы по HTTPS в production; dev — http localhost.

---

## 10. Риски
- Расхождение DTO mock ↔ OpenAPI (проверять по `FIGMA_DTO_VERIFICATION.md`).
- Отсутствие test-раннера на фронте — добавление vitest требует согласования (Dependencies Rule).
- RLS: клиент не должен обходить; все запросы с JWT.
- Мульти-клиника: корректная передача clinic context (если требуется заголовок).
- Expo SDK 57 + RN 0.86 — новые версии; проверять совместимость нативных модулей.

---

## 11. Следующие шаги (чек-лист)

- [ ] Создать `.env.example` для frontend (`VITE_API_URL`).
- [ ] Реализовать shared API client (mobile + web) — раздел 5.
- [ ] Реализовать auth flow (mobile + web) — раздел 6.
- [ ] Заменить mock на реальные вызовы по приоритету — раздел 7.
- [ ] Добавить unit-тесты (vitest/jest) — после согласования.
- [ ] Smoke-тесты на Expo Go + web dev server.
- [ ] EAS preview build (APK) для финальной проверки.
- [ ] Синхронизировать `docs/BACKEND_SPEC.md`, `docs/CLIENT_MAPPING.md`, `docs/openapi.json` при изменениях контрактов.

---

## 12. Вопросы/ответы (FAQ)

**Q: Нужно ли Python-виртуальное окружение для React?**
A: Нет. React/Vite и Expo работают на Node.js. Python venv нужен только для backend (`SechHack_26/backend`). Фронтенд/мобилка используют `npm install` в своих папках.

**Q: Нужно ли собирать APK на каждом шаге?**
A: Нет. Для разработки и большинства проверок достаточно Expo Go (`npx expo start`) + сканирование QR. APK/IPA собираются в конце (или для smoke-теста нативных модулей) через EAS. Локальная сборка `npx expo run:android` возможна при установленном Android SDK.

**Q: Что такое Expo Orbit и нужен ли он?**
A: Expo Orbit — десктопное приложение для запуска EAS-сборок на симуляторах/устройствах и просмотра логов. Удобен, но не обязателен: для dev хватает Expo Go + эмуляторов. Рекомендуется подключить на этапе E2E/финальной проверки.

**Q: Можно ли тестировать через код без эмулятора?**
A: Логику и API-вызовы — да (unit-тесты, web dev server в браузере). Нативные функции (камера QR, push) требуют устройства/эмулятора или dev-client.

