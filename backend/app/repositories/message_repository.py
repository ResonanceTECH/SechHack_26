"""Message repository."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message


class MessageRepository:
    async def create_message(self, db: AsyncSession, data: dict) -> Message:
        row = Message(
            sender_id=uuid.UUID(str(data["sender_id"])),
            recipient_id=uuid.UUID(str(data["recipient_id"])),
            patient_id=uuid.UUID(str(data["patient_id"])) if data.get("patient_id") else None,
            body=data["body"],
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_message(self, db: AsyncSession, message_id: str) -> Message | None:
        try:
            mid = uuid.UUID(str(message_id))
        except ValueError:
            return None
        return (await db.execute(select(Message).where(Message.id == mid))).scalar_one_or_none()

    async def list_messages(
        self,
        db: AsyncSession,
        *,
        patient_id: str | None = None,
        user_id: str | None = None,
        only_for_user: bool = False,
    ) -> list[Message]:
        q = select(Message)
        if patient_id:
            try:
                pid = uuid.UUID(str(patient_id))
            except ValueError:
                return []
            q = q.where(Message.patient_id == pid)
        if only_for_user and user_id:
            try:
                uid = uuid.UUID(str(user_id))
            except ValueError:
                return []
            q = q.where((Message.sender_id == uid) | (Message.recipient_id == uid))
        q = q.order_by(Message.created_at.asc())
        return list((await db.execute(q)).scalars().all())

    async def mark_read(self, db: AsyncSession, message_id: str) -> Message | None:
        row = await self.get_message(db, message_id)
        if row is None:
            return None
        if not row.is_read:
            row.is_read = True
            row.read_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(row)
        return row