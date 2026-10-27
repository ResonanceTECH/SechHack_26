# Отчёт о подготовке к деплою — SechHack_26

Дата: 2026-10-27

## 1. Выполненные изменения
- Актуализированы зависимости (`pyproject.toml`, `requirements.txt`, корневой `requirements.txt`).
- Переписан `backend/Dockerfile` (установка из `requirements.txt`, entrypoint с миграциями).
- Обновлён `docker-compose.yml`: healthcheck backend, сервис frontend (nginx).
- Добавлены `frontend/Dockerfile`, `frontend/nginx.conf`, `backend/entrypoint.sh`.
- Создана документация `docs/DEPLOYMENT.md`.

## 2. Аудит секретов
- Захардкоженных ключей/токенов в коде не найдено.
- `.env` исключён из git; `.env.example` содержит только плейсхолдеры.
- Dev-секрет (`SECRET_KEY=local-dev-...`) только локально.

## 3. E2E проверка
- Backend: `pytest -q` — 164 passed.
- Backend (Docker): build + up + health + миграции — OK.
- Frontend: `npm run build` — OK; Docker-образ собран, контейнер отдаёт HTTP 200.
- Mobile: `npx tsc --noEmit` — OK.

## 4. Известные ограничения
- Mobile не контейнеризуется (сборка APK/IPA через EAS).
- Celery/очереди не реализованы.
- SMS — dev-заглушка.
- PDF-отчёты не реализованы.
