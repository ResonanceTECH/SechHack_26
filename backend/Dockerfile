# Clinical Compass — Backend Dockerfile
# Build: docker build -f backend/Dockerfile -t cc-backend .
# Run:   docker compose up -d (см. docker-compose.yml)

FROM python:3.11-slim

# Внутренняя работа
WORKDIR /app

# Системные зависимости для asyncpg + psycopg удалены:
# asyncpg/psycopg2-binary ставятся из wheels, поэтому apt-пакеты не нужны.

# Копируем конфигурацию проекта
COPY backend/pyproject.toml backend/README.md ./

# Устанавливаем package в editable-режиме (включает app пакет)
RUN pip install --no-cache-dir -e .

# Копируем исходный код приложения
COPY backend/app ./app

# Миграции
COPY backend/alembic alembic
COPY backend/alembic.ini alembic.ini

# Экспонируем порт
EXPOSE 3001

# Старт приложения
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001"]
