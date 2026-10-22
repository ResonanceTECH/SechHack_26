"""Health-check эндпоинты.

`/health` и `/db/health` — на корне (не под /api/v1), чтобы сохранить
совместимость с мобильным клиентом `mobile_dev` (`src/api/client.ts`),
который уже вызывает именно эти пути на порту 3001.
"""

from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import text

from app.api.dependencies import DbSession
from app.core.response import ok
from app.schemas.common import EnvelopeResponse

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    """Простой health-check без зависимостей от БД (мобильный клиент ждёт {ok})."""
    return {"ok": True}


@router.get("/db/health")
async def db_health(db: DbSession) -> dict:
    """Health-check БД: SELECT NOW() / current_database()."""
    result = await db.execute(text("SELECT NOW() AS now, current_database() AS db"))
    row = result.mappings().one()
    return {"ok": True, "now": row["now"].isoformat(), "db": row["db"]}


@router.get("/api/v1/health", response_model=EnvelopeResponse)
async def health_v1() -> dict:
    """Тот же health-check внутри v1-конверта — для единообразия API."""
    return ok({"status": "healthy"})
