"""Message service."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import PatientProfile
from app.repositories.message_repository import MessageRepository


class MessageService:
    def __init__(self, repo: MessageRepository | None = None):
        self.repo = repo or MessageRepository()

    async def _patient_profile(self, db: AsyncSession, user) -> PatientProfile | None:
        res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == uuid.UUID(str(user.id))))
        return res.scalar_one_or_none()

    async def create_message(self, db: AsyncSession, current_user, data: dict) -> "Message":
        data = dict(data)
        data["sender_id"] = str(current_user.id)
        return await self.repo.create_message(db, data)

    async def list_messages(self, db: AsyncSession, current_user, patient_id: str | None = None) -> list:
        if getattr(current_user, "role", "") == "patient":
            prof = await self._patient_profile(db, current_user)
            if prof is None:
                return []
            pid = str(prof.id)
            if patient_id and patient_id != pid:
                return []
            return await self.repo.list_messages(db, patient_id=pid, user_id=str(current_user.id), only_for_user=True)
        return await self.repo.list_messages(db, patient_id=patient_id, user_id=str(current_user.id), only_for_user=False)

    async def get_message(self, db: AsyncSession, message_id: str):
        return await self.repo.get_message(db, message_id)

    async def mark_read(self, db: AsyncSession, message_id: str):
        return await self.repo.mark_read(db, message_id)