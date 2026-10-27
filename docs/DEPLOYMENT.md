# Развёртывание «Клинический компас» (SechHack_26)

## 1. Предварительные требования

| Компонент | Версия | Назначение |
|---|---|---|
| Docker + Docker Compose | 24+ / 2.x | Полный стек бэкенда |
| Python | 3.11+ | Локальная разработка бэкенда |
| Node.js | 20+ (LTS) | Frontend (Vite) и mobile (Expo) |
| npm | 10+ | Установка JS-зависимостей |
| PostgreSQL | 16 (через Docker) | База данных |
| Redis | 7 (через Docker) | Rate-limit |

## 2. Конфигурация окружения

1. Скопируйте шаблон:
   ```bash
   cp SechHack_26/backend/.env.example SechHack_26/backend/.env
   cp SechHack_26/.env.example SechHack_26/.env   # если есть
   ```
2. Заполните секреты:
   - `SECRET_KEY` — минимум 32 символа (генерация: `python -c "import secrets; print(secrets.token_urlsafe(48))"`).
   - `DATABASE_URL` — строка подключения к PostgreSQL.
   - `CORS_ORIGINS` — список origin фронтенда/мобилки.
3. **Никогда** не коммитьте `.env` (он в `.gitignore`).
4. В production выставьте `ENVIRONMENT=production`, `DEBUG=false`, `LOG_LEVEL=INFO`.

## 3. Запуск в Docker (рекомендуемый)

Из каталога `SechHack_26`:

```bash
docker compose up -d --build
```

Сервисы:
- `cc-postgres` — PostgreSQL 16 (порт `${DB_PORT:-5432}`).
- `cc-redis` — Redis 7 (порт `${REDIS_PORT:-6379}`).
- `cc-backend` — FastAPI (порт `${PORT:-3001}`), миграции применяются автоматически при старте.
- `cc-frontend` — React/Vite, собранный и отданный через nginx (порт `${FRONTEND_PORT:-8080}`), проксирует `/api/*` на backend.

Проверка:
```bash
curl http://localhost:3001/health        # -> ok
curl http://localhost:3001/db/health    # -> true
```

Миграции (применяются автоматически при первом запуске; при обновлении):
```bash
docker exec cc-backend alembic upgrade head
```

Остановка:
```bash
docker compose down          # сохранить данные БД
docker compose down -v       # удалить volume БД
```

## 4. Локальная разработка (без Docker для кода)

Бэкенд:
```bash
cd SechHack_26/backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# запустить postgres/redis (например через docker compose up postgres redis -d)
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
```

Frontend:
```bash
cd SechHack_26/frontend
npm ci
npm run dev          # http://localhost:5173
npm run build        # production build в dist/
```

Mobile (Expo):
```bash
cd SechHack_26/mobile
npm ci
npx expo start       # затем a/i/w для платформ
```

## 5. Тесты

Бэкенд (164 теста):
```bash
cd SechHack_26/backend
pytest -q
```
Требуется доступный PostgreSQL на `localhost:5432` (или `SKIP_DB_TESTS=1` для пропуска DB-тестов).

Frontend:
```bash
cd SechHack_26/frontend
npm run build        # tsc -b && vite build
```

Mobile:
```bash
cd SechHack_26/mobile
npx tsc --noEmit
```

## 6. Секреты и безопасность

- Секреты хранятся только в `.env` (исключён из git).
- В репозитории нет захардкоженных ключей/токенов; `.env.example` содержит плейсхолдеры.
- `SECRET_KEY` валидируется (min 32 символа).
- JWT access 15 мин / refresh 7 дней, Argon2id для паролей.
- CORS whitelist из `CORS_ORIGINS`.
- Rate-limit входа (5 попыток / 15 мин).
- Рекомендуется в production использовать внешний секрет-менеджер (Vault/AWS SM) и ротацию ключей.

## 7. Структура

```
SechHack_26/
├── backend/          # FastAPI + SQLAlchemy + Alembic
├── frontend/         # React 19 + Vite (кабинет врача)
├── mobile/           # React Native / Expo (пациент)
├── docs/             # документация и отчёты
├── docker-compose.yml
├── requirements.txt  # агрегатор Python-зависимостей
└── .env              # локальные секреты (не в git)
```

## 8. Известные ограничения

- Фронтенд упакован в Docker (nginx). Mobile не контейнеризуется — собирается отдельно (APK/IPA).
- Celery/очереди не реализованы (Redis используется опционально).
- SMS — dev-заглушка.
- PDF-отчёты не реализованы.
