#!/bin/sh
set -e

# Apply database migrations before starting the app
alembic upgrade head

exec uvicorn app.main:app --host 0.0.0.0 --port 3001