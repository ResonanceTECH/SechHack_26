from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.integration import IntegrationEvent


class IntegrationRepository:
    async def create(self, db: AsyncSession, data: dict[str, Any]) -> IntegrationEvent:
        row = IntegrationEvent(**data)
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_by_id(self, db: AsyncSession, event_id: str) -> IntegrationEvent | None:
        try:
            eid = uuid.UUID(event_id)
        except ValueError:
            return None
        return (await db.execute(select(IntegrationEvent).where(IntegrationEvent.id == eid))).scalar_one_or_none()

    async def get_by_idempotency_key(self, db: AsyncSession, key: str) -> IntegrationEvent | None:
        return (await db.execute(select(IntegrationEvent).where(IntegrationEvent.idempotency_key == key))).scalar_one_or_none()