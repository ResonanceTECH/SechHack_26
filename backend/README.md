# Clinical Compass Backend

FastAPI + PostgreSQL (MVP) backend for Clinical Compass. 

## API
- `/health` — health check (no DB required)
- `/db/health` — DB connectivity check
- `/api/v1/auth/*` — authentication (email, SMS, refresh, logout, me)
- `/api/v1/practitioners/*` — invite codes

## Docker
- `docker compose up -d` — start postgres, redis, backend

## Config
- Env file: `.env` (see `.env.example` for template)
- .NET region 3001 (configurable)