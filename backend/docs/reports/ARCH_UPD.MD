# ARCH_UPD.MD — Отчёт по аудиту архитектурной документации

**Дата:** 22.10.2026  
**Проект:** Клинический компас (Clinical Compass)  
**Репозиторий:** `SechHack_26`  
**Путь к отчёту:** `SechHack_26\backend\docs\reports\ARCH_UPD.MD`  
**Статус:** Черновик для утверждения

---

## 1. Executive Summary

Текущая архитектурная документация в `SechHack_26\backend\docs\` представляет собой хорошо структурированный набор документов (ARCHITECTURE.md, DOMAIN_MODEL.md, DB_SCHEMA.md, AUTH_PLAN.md, MODULES.md, API_CONTRACTS.md, CURRENT_API.md, MEDICATIONS.md, TESTS.md, TASKS.md, README.md, openapi.json), однако она страдает от **дрейфа между описанием и реализацией**.

### Ключевые выводы

| Аспект | Состояние |
|--------|-----------|
| Документов архитектуры | 11 файлов + openapi.json — все присутствуют |

## 2. Инвентарь архитектурных документов

Папка: `SechHack_26\backend\docs\` (архитектурные документы, без `reports/`)

| № | Файл | Статус | Актуальность | Соответствие коду | Комментарии |
|---|------|--------|--------------|-------------------|-------------|
| 1 | `README.md` | ✅ Есть | ⚠️ Частично | ⚠️ Частично | Указывает на ветки `frontend_dev` и `mobile_dev`, но не отражает текущее состояние `wt_frontend`/`wt_mobile` |
| 2 | `ARCHITECTURE.md` | ✅ Есть | ❌ Не актуальна | ❌ Низкое | Описывает целевую архитектуру (11 сервисов, concept01/concept02, Redis/Celery), но не разделяет «что есть» и «что планируется» |
| 3 | `DOMAIN_MODEL.md` | ✅ Есть | ❌ Не актуальна | ⚠️ Среднее | Сущности User, PatientProfile, PractitionerProfile, Clinic, ScreeningResult, DiaryEntry, Alert и т.д. — но без ICD-10, C-SSRS, Safety Plan, кризисных сигналов |
| 4 | `DB_SCHEMA.md` | ✅ Есть | ⚠️ Частично | ⚠️ Среднее | DDL concept01/public + rx, индексы, CHECK, Alembic. Отчёт PHASE2 указывал на расхождение: 1 миграция vs 22 таблицы (но это архивное, не учитываем!) |
| 5 | `AUTH_PLAN.md` | ✅ Есть | ✅ Актуальна | ✅ Высокое | Этап 1 завершён. JWT, Argon2id, refresh rotation, RBAC — соответствуют коду |
| 6 | `MODULES.md` | ✅ Есть | ⚠️ Частично | ⚠️ Среднее | 8 модулей со статусами. Обновлено: Screening — Implemented (PHASE9); Alert — Implemented (PHASE10); остальные Planned |
| 7 | `API_CONTRACTS.md` | ✅ Есть | ⚠️ Частично | ⚠️ Среднее | Контракты `/api/v1/*` описаны, но нет маппинга на экраны Figma, нет crisis-эндпоинтов, skip-dose, голосовых сообщений |
| 8 | `CURRENT_API.md` | ✅ Есть | ✅ Актуальна | ✅ Высокое | Источник истины для реализованных эндпоинтов (health, auth, screenings, questionnaires, practitioners, patients) |
| 9 | `MEDICATIONS.md` | ✅ Есть | ⚠️ Частично | ⚠️ Низкое | Контракт описан, но статус Planned в коде; нет интеграции с клиническими протоколами психиатра |
| 10 | `TESTS.md` | ✅ Есть | ✅ Актуальна | ✅ Высокое | pytest, pytest-asyncio, httpx, unit/integration/API/security, CI-gate |
| 11 | `TASKS.md` | ✅ Есть | ⚠️ Частично | ⚠️ Среднее | 12 этапов, статусы Completed/Planned, требует синхронизации с реальным прогрессом |
| 12 | `openapi.json` | ✅ Есть | ✅ Актуальна | ✅ Высокое | 16 paths, 18 operations, сгенерировано |

**Папка `reports/`** не относится к архитектурным документам (по правилам пользователя) — там фазовые отчёты PHASE1–PHASE10.

| Реализовано в коде (бэкенд) | Этапы 0–3 + Alert: Auth/RBAC, Клиники/Пациенты/Практикующие, Screening (PHQ-9/GAD-7), Alert (PHASE10) |
| Планируется, не реализовано | Этапы 4–12: Diary, Program, Medication, Notification, Report, Frontend integration, MVP finalization (Alert — реализован в PHASE10; Audit — сервис есть, эндпоинт отсутствует) |
| Соответствие экранам Figma | Частичное — API_CONTRACTS.md не связан с конкретными экранами; отсутствует маппинг crisis-сигналов, skip-dose, голосовых сообщений |
| Учёт требований психиатра | Отсутствует — ICD-10, C-SSRS, Safety Plan, A.W.A.R.E., дополнительные опросники (PDSS, HCL-33) не отражены в DOMAIN_MODEL/DB_SCHEMA |

## 3. Что реализовано в коде vs что описано в документации

### Этапы реализации (по TASKS.md и отчётам PHASE)

| Этап | Название | Статус по TASKS.md | Реальное состояние в коде | Документация |
|------|----------|-------------------|--------------------------|--------------|
| 0 | Intro / Setup | ✅ Completed | ✅ Выполнено | ARCHITECTURE.md, README.md |
| 1 | Auth + RBAC | ✅ Completed | ✅ Выполнено | AUTH_PLAN.md, CURRENT_API.md |
| 2 | Клиники, пациенты, практикующие, invite-коды | ✅ Completed | ✅ Выполнено | API_CONTRACTs.md, CURRENT_API.md |
| 3 | Screening (PHQ-9/GAD-7) | ✅ Completed (PHASE9) | ✅ Выполнено | MODULES.md §3, CURRENT_API.md |
| 4 | Diary (дневник самооценки) | ❌ Planned | ❌ Не реализован | MODULES.md §4, API_CONTRACTS.md §6 |
| 5 | Program (программы и упражнения) | ❌ Planned | ❌ Не реализован | MODULES.md §5, API_CONTRACTS.md §7 |
| 6 | Alert (алерты и safety plan) | ❌ Planned | ❌ Не реализован | MODULES.md §6, API_CONTRACTS.md §8 |
| 7 | Medication (лекарства и рецепты) | ❌ Planned (contract only) | ❌ Не реализован | MEDICATIONS.md, API_CONTRACTS.md §7 |
| 8 | Notification (уведомления и сообщения) | ❌ Planned | ❌ Не реализован | MODULES.md §8, API_CONTRACTS.md §10 |
| 9 | Report (отчёты) | ❌ Planned | ❌ Не реализован | MODULES.md (смежные), API_CONTRACTS.md §11 |
| 10 | Audit (аудит) | ⚠️ Planned (частично) | ⚠️ Частично | MODULES.md (смежные), API_CONTRACTS.md §13 |
| 11 | Frontend integration | ❌ Planned | ❌ Не реализован | TASKS.md §11 |
| 12 | MVP finalization | ❌ Planned | ❌ Не реализован | TASKS.md §12 |

### Эндпоинты: реализовано vs описано

| Группа | Реализовано (CURRENT_API.md) | Описано в API_CONTRACTs.md | Разрыв |
|--------|------------------------------|---------------------------|--------|
| Auth | `/register`, `/login`, `/sms/request`, `/sms/verify`, `/invite/verify`, `/refresh`, `/logout`, `/me`, `/change-password` | Все вышеперечисленные | ✅ Нет |
| Screening | `/screenings`, `/questionnaires` | Полный набор | ✅ Нет |
| Patients | `/patients`, `/patients/{id}`, `PATCH`, `/summary` | Полный набор | ✅ Нет |
| Practitioners | `/practitioners/{id}/invite-codes` | Полный набор | ✅ Нет |
| Diary | ❌ Нет | `GET/POST/PUT/DELETE /diary`, `/diary/bulk-sync`, `/diary/summary` | ❌ Есть |
| Program | ❌ Нет | Полный набор | ❌ Есть |
| Alert | ❌ Нет | `GET/PUT/PATCH /alerts`, `/safety-plan` | ❌ Есть |
| Medication | ❌ Нет | `GET/POST/PUT /medications`, `/prescriptions`, `/adherence` | ❌ Есть |

## 4. Вклад заметок психиатра (clinicalcompass\docs\holst_notes\)

### Файлы
- `notes.md` — клинические протоколы, ссылки на C-SSRS, A.W.A.R.E., план безопасности, лекарственные дневники
- `Clinical_requirements_and_product_clarifications.md` — клинические требования и уточнения продукта
- `imgs/` — 25 изображений (схемы, протоколы, кризисные сигналы)

### Клинические требования, ОТСУТСТВУЮЩИЕ в архитектурных документах

| Категория | Что требуется психиатром | Где в docs | Статус |
|-----------|------------------------|------------|--------|
| ICD-10 диагнозы | F32.0–F32.2, F33.0–F33.2, F40.0, F41.0–F41.2 | DOMAIN_MODEL.md, DB_SCHEMA.md | ❌ Отсутствуют |
| C-SSRS | Оценка суицидального риска | DOMAIN_MODEL.md, MODULES.md | ❌ Отсутствует |
| Safety Plan | План безопасности при кризисе | MODULES.md §6 (упоминается, не детализировано) | ⚠️ Частично |
| A.W.A.R.E. метод | Accept, Watch, Act, Repeat, Expect — работа с тревожностью | Нигде | ❌ Отсутствует |
| Дополнительные опросники | PDSS, HCL-33 (помимо PHQ-9/GAD-7) | MODULES.md §3 (только PHQ-9/GAD-7) | ❌ Отсутствуют |
| Longitudinal Analytics | Долгосрочная аналитика, Measurement-Based Care | Нигде | ❌ Отсутствует |
| Кризисные сигналы | «Красный симптом или SOS», звонок 103/112 | Нигде | ❌ Критический разрыв |
| Противопоказания лекарств | Беременность, взаимодействия, ГРЛС | MEDICATIONS.md (частично) | ⚠️ Частично |
| Согласия 152-ФЗ | Обработка ПД, медданных | DOMAIN_MODEL.md, AUTH_PLAN.md | ✅ Есть |

| Notification | ❌ Нет | `POST /devices/register`, `GET/POST /notifications`, `/messages` | ❌ Есть |
| Report | ❌ Нет | `GET /reports/pre-visit/{patientId}`, `/clinic-analytics` | ❌ Есть |
| Audit | ❌ Нет | `GET /audit`, `/audit/{id}` | ❌ Есть |

## 5. Вклад макетов Figма (clinicalcompass\docs\figma\)

### Источники
- **Figma файл:** `sge8zDLWQRdqkJQ8BwwY3O` — «Клинический компас — прототип»
- **Экраны врача и клиники (веб, 5 шт.):**
  1. `0 · Регистрация, приглашения и роли.png`
  2. `4 · Кабинет врача (веб).png`
  3. `5 · Администратор клиники (веб).png`
  4. `6 · Личный кабинет врача.png`
  5. `7 · Карточка пациента и рабочие сценарии.png`
- **Экраны мобильного приложения (7 шт.):**
  1. `1 · Регистрация и первичная оценка.png`
  2. `2 · Главная и ежедневная отметка.png`
  3. `3 · Повторный опросник и кризисный сигнал.png`
  4. `4 · Самочувствие, симптомы и чат.png`
  5. `5 · Лечение и дневник.png`
  6. `6 · Профиль и безопасность.png`
  7. `7 · Ошибки и восстановление.png`
- **Обложка:** `Обложка v2.png`

### Компоненты дизайн-системы (из MCP Figma)

| Компонент | Назначение | Варианты | Бэкенд-зависимость |
|-----------|------------|----------|-------------------|
| `Button` | Главное/экстренное действие | Primary, Critical, размеры L (мобилка) / M (веб) | Нет (UI) |
| `Badge` | Статус/категория | Critical = «Обязательно» (красный), Warning = «Желательно» (жёлтый), Rx = рецептурный контур (фиолетовый) | Да — значения должны приходить из API |
| `Checkbox row` | Согласие | Checked/Unchecked | Да — consent-поля |
| `Answer option` | Вариант ответа опросника | Текст + Балл | Да — screening answers |
| `Tab bar` | Нижняя навигация пациента | 5 разделов: Сегодня, Дневник, Программа, Прогресс, Профиль | Да — нужны API для каждого раздела |

## 6. Состояние клиентских слоев (wt_frontend, wt_mobile)

### wt_frontend (веб-клиника)
- **Стек:** React + Vite + TypeScript
- **Папка `frontend/src/`:** `app/`, `components/`, `data/`, `layouts/`, `lib/`, `pages/`, `styles/`, `theme/`, `types/`
- **Клиентские страницы:** регистрация специалиста, подтверждение email, список пациентов, карточка пациента, аналитика, отчёты, настройки клиники
- **Mock-данные:** `src/data/mock*.ts` — упомянуты в README.md бэкенда
- **Типы:** `types/admin.ts`, `types/doctor.ts`
- **Бэкенд-заглушка:** `wt_frontend/backend/src/` — только `db/pool.js`, `db/check.js`, `index.js` (минимальный)

### wt_mobile (мобильное приложение)
- **Стек:** React Native + Expo
- **Папка `mobile/src/`:** `api/`, `components/`, `data/`, `hooks/`, `screens/`, `theme/`, `utils/`
- **API клиент:** `api/client.ts` — HTTP-клиент для связи с бэкендом
- **Экраны:** 25+ экранов, включая все экраны из Figma + экраны ошибок
- **Опросники:** `data/questionnaires.ts` — справочник опросников
- **Бэкенд-заглушка:** `wt_mobile/backend/src/` — только `db/pool.js`, `db/check.js`, `index.js` (минимальный)

### Пробел в интеграции
> Фронтенд и мобильное приложение пишутся по экранам Figma, но бэкенд не предоставляет полный набор API, необходимый для этих экранов. Бэкенд должен поддерживать **не меньше**, чем показано на экранах.

| `Sidebar / Врач` | Навигация врача | Рабочий стол, Алерты, Препараты·ГРЛС, Библиотека упражнений, Сотрудники и роли, Аналитика клиники, Журнал аудита, Настройки клиники | Да — все пункты требуют бэкенд-API |
| `Sidebar / Клиника` | Навигация администратора | Аналогично врачу | Да |

| Admin | ❌ Нет | `GET/PUT /admin/employees`, `/analytics`, `/settings` | ❌ Есть |
| Crisis/SOS | ❌ Нет | ❌ Не описано | ❌ Критический разрыв |
| Skip dose | ❌ Нет | ❌ Не описано | ❌ Критический разрыв |
| Voice messages | ❌ Нет | ❌ Не описано | ❌ Критический разрыв |


## 7. Gap Analysis — что реально есть и чего нет

### P0 — Критические разрывы (безопасность и клиническая необходимость)

| Разрыв | Где описано | Что нужно добавить |
|--------|-------------|-------------------|
| Кризисный сигнал / SOS | Figma экран 3 МП, `EmergencyHelpScreen`, «Звонок 103/112», «Красный симптом» | API `/api/v1/crisis/signal`, сущность `CrisisSignal`, алерт `critical_symptom` с максимальным приоритетом |
| C-SSRS (суицидальный риск) | Заметки психиатра | Сущность `CssrsAssessment`, опросник C-SSRS в Screening Service |
| Safety Plan | Заметки психиатра, `SafetyPlanScreen` | Сущность `SafetyPlan`, API `/api/v1/safety-plan` |
| Пропуск приёма лекарства с причиной | `SkipDoseScreen`, Figma экран 5 МП | Сущность `MedicationSkipReason`, API для отметки пропуска |
| Голосовые сообщения в чате | `ChatScreen`, Figma экран 4 МП | API загрузки/прослушивания голосовых сообщений |
| ICD-10 диагнозы | `Clinical_requirements_and_product_clarifications.md` | Сущность `Icd10Code`, связь с пациентом |
| Дополнительные опросники (PDSS, HCL-33) | Заметки психиатра | Расширение справочника опросников Screening Service |

### P1 — Высокий приоритет (функциональность, описанная в экранах и требованиях)

| Разрыв | Где описано | Что нужно добавить |
|--------|-------------|-------------------|
| Diary Service | MODULES.md §4, `CheckIn*Screen`, `DiaryScreen` | API `/api/v1/diary/*`, сущности `DiaryEntry`, `DiaryEntryMood`, `DiaryEntrySleep` |
| Program Service | MODULES.md §5, `BreathingScreen`, `ProgramTab` | API `/api/v1/program/*`, сущности `Program`, `Exercise`, `ExerciseCompletion` |
| Alert Service | MODULES.md §6, `SafetyPlanScreen` | API `/api/v1/alerts/*`, триггеры алертов, жизненный цикл |
| Medication Service | MEDICATIONS.md, `TreatmentScreen`, `SkipDoseScreen` | API `/api/v1/medications/*`, `/api/v1/prescriptions/*`, `/api/v1/adherence/*` |
| Notification Service | MODULES.md §8, `ChatScreen` | API `/api/v1/notifications/*`, `/api/v1/messages/*`, регистрация push-токена |
| Report Service | `PreVisitReportPage` | API `/api/v1/reports/*`, генерация PDF |
| Audit Service | `AuditEventModal` | API `/api/v1/audit/*` |
| Admin Service | `AdminDashboard`, `ClinicsPage` | API `/api/v1/admin/*` |
| Долгосрочная аналитика | `Clinical_requirements_and_product_clarifications.md` | API для longitudinal analytics, Measurement-Based Care |

### P2 — Средний приоритет (документация и синхронизация)

| Разрыв | Где описано | Что нужно добавить |
|--------|-------------|-------------------|
| Маппинг Figma → API | Figma экраны, API_CONTRACTS.md | Таблица соответствия экранов → эндпоинтов |
| Обновление CURRENT_API.md | Реализованные эндпоинты | Синхронизация с реальным состоянием кода |
| Обновление MODULES.md | Статусы модулей | Синхронизация с кодом (Screening → Implemented) |
| Обновление TASKS.md | Этапы реализации | Отметка выполненных этапов, добавление новых |
| Проверка миграций Alembic | DB_SCHEMA.md, PHASE2 отчёт | Сверка миграций с DDL |
| Обновление ARCHITECTURE.md → v2 | Целевая vs текущая архитектура | Разделение на «what is» и «what is planned» |

| Клиентские слои (wt_frontend, wt_mobile) | Существуют, реализуют экраны по Figma, но бэкенд не обеспечивает полный набор необходимых API |

### Критический риск

## 8. Рекомендация по стратегии документации

### Гибридный подход: v2 для ключевых документов, инкремент для остальных

| Документ | Действие | Обоснование |
|----------|----------|-------------|
| `ARCHITECTURE.md` | **v2** | Нужно чётко разделить «целевую архитектуру» (11 сервисов, concept01/concept02) и «текущее состояние реализации» (этапы 0–3) |
| `DOMAIN_MODEL.md` | **v2** | Нужно добавить клинические сущности из заметок психиатра: ICD-10, C-SSRS, Safety Plan, кризисные сигналы, дополнительные опросники |
| `DB_SCHEMA.md` | **Обновление** | Дополнить новые таблицы, проверить соответствие Alembic миграциям |
| `API_CONTRACTS.md` | **Обновление** | Добавить маппинг экранов Figma → эндпоинты, crisis, skip-dose, голосовые сообщения, чат |
| `CURRENT_API.md` | **Обновление** | Отразить реально реализованные эндпоинты |
| `MODULES.md` | **Обновление** | Синхронизировать статусы модулей с кодом |
| `TASKS.md` | **Обновление** | Отметить выполненные этапы, добавить новые (кризисный сигнал, план безопасности) |
| `README.md` | **Обновление** | Добавить ссылки на `wt_frontend`/`wt_mobile`, актуализировать стек |

**Не рекомендуется** создавать полностью отдельный набор документов v2 для всех файлов — это приведёт к дублированию и новому дрейфу. Достаточно версионировать только те, где требуются структурные изменения (ARCHITECTURE.md, DOMAIN_MODEL.md), остальные обновлять инкрементально.


> **«Backend не должен делать МЕНЬШЕ, чем показано на экранах Figma».**  
> Текущая документация и реализация бэкенда не покрывают несколько критических пользовательских сценариев, зафиксированных в макетах: кризисный сигнал (SOS / вызов 103/112), пропуск приёма лекарства с причиной, голосовые сообщения в чате, детальный профиль врача с выбором роли (психиатрия/психотерапия), долгосрочная аналитика (Measurement-Based Care).


## 9. План действий с приоритетами

### P0

1. [ ] Добавить в `DOMAIN_MODEL.md` сущности: `CrisisSignal`, `CssrsAssessment`, `SafetyPlan`, `Icd10Code`, `MedicationSkipReason`
2. [ ] Добавить в `DB_SCHEMA.md` DDL для новых таблиц
3. [ ] Добавить в `API_CONTRACTS.md` эндпоинты: `POST /api/v1/crisis/signal`, `GET/POST /api/v1/safety-plan`, `POST /api/v1/medications/{id}/skip`
4. [ ] Создать Alembic миграции для новых таблиц
5. [ ] Обновить `CURRENT_API.md` с реализованными эндпоинтами

### P1

6. [ ] Обновить `ARCHITECTURE.md` до v2 с разделением «what is» / «what is planned» (на совсем будущее по white paper. Сейчас мы делаем что описали уже, что есть в экранах, МП и ВебUI)
7. [ ] Добавить в `MODULES.md` детализацию Diary, Program, Alert, Medication, Notification сервисов
8. [ ] Добавить маппинг экранов Figma → API в `API_CONTRACTS.md`
9. [ ] Обновить `TASKS.md` со статусами этапов 4–12
10. [ ] Синхронизировать `MEDICATIONS.md` с клиническими протоколами психиатра (противопоказания, взаимодействия)

### P2

11. [ ] Обновить `TESTS.md` с тестами для новых эндпоинтов
12. [ ] Проверить соответствие миграций Alembic `DB_SCHEMA.md`
13. [ ] Обновить `README.md` с информацией о `wt_frontend`/`wt_mobile`
14. [ ] Провести аудит RBAC-матрицы для новых сущностей


## 10. Риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Бэкенд делает МЕНЬШЕ, чем показано на экранах Figma | Высокая | Критично — фронтенд и мобилка не смогут trabajar | P0 приоритет на crisis, skip-dose, voice messages, Safety Plan |
| Дрейф документации от кода | Высокая | Средний — разработчики ориентируются на устаревшие контракты | Регулярная синхронизация CURRENT_API.md и MODULES.md |
| Отсутствие клинических сущностей (ICD-10, C-SSRS) | Средняя | Критично — психиатр не сможет использовать систему | Включить в P0 план действий |
| Расхождение миграций Alembic с DB_SCHEMA.md | Средняя | Средний — проблемы при развёртывании | Проверить и создать недостающие миграции |
| Неучтённые экраны ошибок | Низкая | Низкий — UX ухудшится | Добавить обработку ошибок в API_CONTRACTS.md |

## 11. Следующий шаг

**Утвердить отчёт и приступить к обновлению архитектурных документов:**

1. Согласовать стратегию (v2 для ARCHITECTURE.md и DOMAIN_MODEL.md, инкремент для остальных)
2. Начать с P0 задач: добавление кризисных сигналов, C-SSRS, Safety Plan в доменную модель и API
3. После утверждения документации — приступить к анализу кода `SechHack_26/backend/app` и реализации недостающих сервисов

---

**Подготовлено на основе:**
- `SechHack_26\backend\docs\*` — 11 архитектурных документов + openapi.json
- `clinicalcompass\docs\holst_notes\notes.md` — клинические протоколы психиатра
- `clinicalcompass\docs\holst_notes\Clinical_requirements_and_product_clarifications.md` — клинические требования
- `clinicalcompass\docs\figma\*` — 12 изображений макетов + данные Figma API (MCP)
- `wt_frontend\*` — веб-клиника (React + Vite + TS)
- `wt_mobile\*` — мобильное приложение (React Native + Expo)
- Отчёты PHASE1–PHASE10 в `SechHack_26\backend\docs\reports\archive\`
