# Clinical Compass — Backend Dockerfile
# Build: docker build -f backend/Dockerfile -t cc-backend .
# Run:   docker compose up -d (см. docker-compose.yml)

FROM python:3.11-slim

WORKDIR /app

# Копируем манифест зависимостей
COPY backend/requirements.txt ./requirements.txt

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код приложения
COPY backend/app ./app

# Миграции
COPY backend/alembic alembic
COPY backend/alembic.ini alembic.ini

# Entrypoint (миграции + старт)
COPY backend/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Экспонируем порт
EXPOSE 3001

# Старт приложения
CMD ["sh", "/app/entrypoint.sh"]
