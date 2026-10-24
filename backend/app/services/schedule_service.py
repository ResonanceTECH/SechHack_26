"""Schedule service."""

from __future__ import annotations

import uuid
from datetime import date, time

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.schedule_repository import ScheduleRepository


class ScheduleService:
    def __init__(self, repo: ScheduleRepository | None = None):
        self.repo = repo or ScheduleRepository()

    async def get_clinic_settings(self, db: AsyncSession, clinic_id: str):
        return await self.repo.get_clinic_settings(db, uuid.UUID(clinic_id))

    async def update_clinic_settings(self, db: AsyncSession, clinic_id: str, timezone: str):
        return await self.repo.upsert_clinic_settings(db, uuid.UUID(clinic_id), timezone)

    async def get_schedule(self, db: AsyncSession, practitioner_id: str):
        return await self.repo.list_schedule(db, uuid.UUID(practitioner_id))

    async def replace_schedule(self, db: AsyncSession, practitioner_id: str, entries: list[dict]):
        return await self.repo.replace_schedule(db, uuid.UUID(practitioner_id), entries)

    async def add_exception(self, db: AsyncSession, practitioner_id: str, data: dict):
        return await self.repo.add_exception(db, uuid.UUID(practitioner_id), data)

    async def delete_exception(self, db: AsyncSession, exception_id: str):
        await self.repo.delete_exception(db, uuid.UUID(exception_id))
        return True
