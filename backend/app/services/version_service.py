from __future__ import annotations

import uuid
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.version_repository import EntityVersionRepository


class EntityVersionService:
    def __init__(self) -> None:
        self.repo = EntityVersionRepository()

    async def record(self, db: AsyncSession, *, entity_type: str, entity_id: str,
                    changed_by: Optional[str], reason: Optional[str] = None,
                    is_addendum: bool = False, snapshot: dict) -> Any:
        vn = await self.repo.next_version_number(db, entity_type, entity_id)
        return await self.repo.create(
            db, entity_type=entity_type, entity_id=entity_id,
            version_number=vn, changed_by=changed_by, reason=reason,
            is_addendum=is_addendum, snapshot=snapshot,
        )

    async def list_versions(self, db: AsyncSession, entity_type: str, entity_id: str):
        return await self.repo.list_for_entity(db, entity_type, entity_id)