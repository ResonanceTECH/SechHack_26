# Clinical Compass — Backend Dockerfile
# Build: docker build -f backend/Dockerfile -t cc-backend .
# Run:   docker compose up -d (см. docker-compose.yml)

FROM python:3.11-slim

# Внутренняя работа
WORKDIR /app

# Системные зависимости для asyncpg + psycopg
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем конфигурацию проекта
COPY backend/pyproject.toml backend/README.md ./

# Устанавливаем package в editable-режиме (включает app пакет)
RUN pip install --no-cache-dir -e .

# Копируем исходный код приложения
COPY backend/app ./app

# Опциональный миграции-мульти-стaged: можно подключить файлы миграций
COPY backend/alembic alembic

# Экспонируем порт
EXPOSE 3001

# Старт приложения
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001"]
