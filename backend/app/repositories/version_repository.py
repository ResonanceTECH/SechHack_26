from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.versioning import EntityVersion


class EntityVersionRepository:
    async def create(self, db: AsyncSession, *, entity_type: str, entity_id: str,
                     version_number: int, changed_by: Optional[str], reason: Optional[str],
                     is_addendum: bool, snapshot: dict) -> EntityVersion:
        row = EntityVersion(
            entity_type=entity_type,
            entity_id=uuid.UUID(str(entity_id)),
            version_number=version_number,
            changed_by=uuid.UUID(str(changed_by)) if changed_by else None,
            reason=reason,
            is_addendum=is_addendum,
            snapshot=snapshot,
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def list_for_entity(self, db: AsyncSession, entity_type: str, entity_id: str) -> list[EntityVersion]:
        try:
            eid = uuid.UUID(str(entity_id))
        except ValueError:
            return []
        stmt = select(EntityVersion).where(
            EntityVersion.entity_type == entity_type,
            EntityVersion.entity_id == eid,
        ).order_by(EntityVersion.version_number.desc(), EntityVersion.changed_at.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def next_version_number(self, db: AsyncSession, entity_type: str, entity_id: str) -> int:
        rows = await self.list_for_entity(db, entity_type, entity_id)
        if not rows:
            return 1
        return max(r.version_number for r in rows) + 1