# Бэкенд «Клинический компас» — документация для разработки

**Статус:** черновик (MVP)  
**Язык:** Python 3.11+  
**Фреймворк:** FastAPI  
**БД:** PostgreSQL `sechhack` (одна база, логическое разделение concept01/concept02)  
**Порт:** 3001 (унифицирован с клиентами)  
**Мобильный клиент:** React Native + Expo — **уже существует** (ветка `mobile_dev` в `SechHack_26`), экраны регистрации ждут API  
**Веб-клиент:** React + Vite + TypeScript — **уже существует** (ветка `frontend_dev` в `SechHack_26`), работает на mock-данных, ждёт API  
**Аутентификация:** собственные JWT (access + refresh), **два входа** — телефон+SMS (мобилка) и email+пароль (веб), argon2, RBAC  
**Фоновые задачи:** Celery + Redis  
**ГРЛС/лекарства:** эндпоинт `/medications` — полная инфа врачу, упрощённая пациенту после назначения  
**Автотесты:** pytest + pytest-asyncio + httpx (обязательно)

## Директория

Все файлы бэкенд-документации лежат в `clinicalcompass/docs/product/backend/`.  
Текущие файлы в `clinicalcompass/docs/product/` не меняются.

## Стек (фиксировано)

| Компонент | Решение | Обоснование |
|---|---|---|
| Язык | Python 3.11+ | ТЗ, быстрая разработка, экосистема ML/данных |
| Веб-фреймворк | FastAPI | REST + авто-OpenAPI, высокая скорость прототипирования |
| ORM | SQLAlchemy 2.0 (async) | Типизация, миграции Alembic |
| Валидация | Pydantic v2 | Схемы запросов/ответов |
| БД | PostgreSQL 15+ | Одна база `sechhack`, хост `localhost:5432` |
| Кеш/очереди | Redis + Celery | Уведомления, алерты, фоновые отчёты |
| Аутентификация | JWT (access 15 мин, refresh 7 дней), argon2; телефон+SMS (мобилка) и email+пароль (веб) | Минимальные затраты, выполнение ИБ-требований 152-ФЗ |
| Мобильный клиент | React Native + Expo | Подтверждено решением команды |
| Веб-клиент | React + Vite + TS | Уже в разработке (ветка `frontend_dev`) |
| Инфраструктура | Docker Compose | Развёртывание на сервере клиники |

## Документы бэкенда

| Файл | Содержание |
|---|---|
| `README.md` | Этот файл: стек, границы MVP, индекс документов |
| `ENV.example` | Шаблон переменных окружения (без секретов) |
| `ARCHITECTURE.md` | Модульный монолит, 11 сервисов, механизмы взаимодействия |
| `DOMAIN_MODEL.md` | Сущности, поля, связи, индексы, ограничения целостности |
| `DB_SCHEMA.md` | DDL concept01/concept02, индексы, CHECK/NOT NULL, миграции |
| `AUTH_PLAN.md` | JWT lifecycle, Argon2, refresh rotation, RBAC-матрица, аудит, компромисс с Keycloak |
| `MODULES.md` | Детализация всех 8 модулей ТЗ §8.2 + смежные модули |
| `API_CONTRACTS.md` | Эндпоинты `/api/v1/*` по Figma и mock-контрактам фронтенда, ролевые ограничения |
| `MEDICATIONS.md` | Модель лекарств, рецепты, полный doctor-view и сокращённый patient-view, статус ГРЛС |
| `TESTS.md` | pytest/pytest-asyncio/httpx, unit/integration/API/security, CI-gate |
| `TASKS.md` | Практический порядок реализации по 13 этапам |

**Рекомендуемый порядок чтения:** `ARCHITECTURE.md` → `DOMAIN_MODEL.md` → `DB_SCHEMA.md` → `AUTH_PLAN.md` → `MODULES.md` → `API_CONTRACTS.md` → `MEDICATIONS.md` → `TESTS.md` → `TASKS.md`.

## Что НЕ входит в текущий спринт

- Keycloak / OIDC — отложено на Релиз 2
- Разделение concept01/concept02 на уровне БД (отдельные БД/схемы) — логическое разделение в одной БД
- Парсинг ГРЛС через API pharm-portal.ru — данные по лекарствам отдаём согласно экранам Figma (полная инфа врачу / упрощённая пациенту)

## Готовые клиенты, ждущие API

В `SechHack_26` уже реализованы клиентские приложения — бэкенд пишется под них:

| Клиент | Ветка | Что готово | Зависимость от API |
|---|---|---|---|
| Веб-кабинет врача | `frontend_dev` | Dashboard, пациенты, карточка, отчёт перед визитом, план лечения, сообщения, алерты, лекарства, упражнения, админка | Работает на mock-данных (`src/data/mock*.ts`); нужен REST `/api/v1/*` |
| Мобильное приложение | `mobile_dev` | Регистрация: телефон → SMS-код (4 цифры) → согласия 152-ФЗ → invite-код врача / QR | Нужны `/auth/sms/request`, `/auth/sms/verify`, `/auth/invite/verify`; базовый URL `http://localhost:3001` |

Invite-код: алфавит `23456789ABCDEFGHJKLMNPQRSTUVWXYZ`, формат UI `RAV-27400` (дефис — маска, на бэкенд без дефиса), TTL задаёт врач. Подробнее — `AUTH_PLAN.md` §3.2.

## Связанные документы

- `clinicalcompass/docs/product/ТЗ_Клинический_Компас_v1.0.md` (§8 техническая архитектура, §5–§6 роли и функции)
- `clinicalcompass/docs/product/Архитектурный_дизайн_моделей.md` (доменная модель, API-контракты, индексы)
- `clinicalcompass/docs/product/Технологический_стек.md` (стек, риски, дорожная карта)
- `clinicalcompass/docs/product/WP/White_Paper.MD` (§4.2 роли, главы 6–11 — краткие описания)
- `clinicalcompass/docs/product/diagrams.md` (Mermaid-диаграммы ролей и контуров)
- `clinicalcompass/docs/product/WP_vs_Local_Compliance_Diffs.md` (таблица соответствий WP §4.2 ↔ локальные доки)
- `clinicalcompass/docs/product/WP_Chapters_6_11_Proposals.md` (предложения по главам 6–11 WP)
