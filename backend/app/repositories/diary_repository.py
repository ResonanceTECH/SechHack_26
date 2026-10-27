from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.clinical import DiaryEntry


class DiaryRepository:
    async def create_entry(self, db: AsyncSession, patient_id: str, data: dict, synced: bool = False) -> DiaryEntry:
        row = DiaryEntry(
            patient_id=uuid.UUID(str(patient_id)),
            recorded_at=data["recorded_at"],
            mood_score=data.get("mood_score"),
            anxiety_score=data.get("anxiety_score"),
            energy_score=data.get("energy_score"),
            functioning_score=data.get("functioning_score"),
            sleep_hours=data.get("sleep_hours"),
            sleep_quality=data.get("sleep_quality"),
            notes=data.get("notes"),
            device_id=data.get("device_id"),
            synced_at=datetime.now(timezone.utc) if synced else None,
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_by_id(self, db: AsyncSession, entry_id: str) -> Optional[DiaryEntry]:
        try:
            eid = uuid.UUID(str(entry_id))
        except ValueError:
            return None
        return (await db.execute(select(DiaryEntry).where(DiaryEntry.id == eid))).scalar_one_or_none()

    async def list_for_patient(self, db: AsyncSession, patient_id: str, date_from=None, date_to=None, limit: int | None = None, offset: int | None = None) -> list[DiaryEntry]:
        try:
            pid = uuid.UUID(str(patient_id))
        except ValueError:
            return []
        stmt = select(DiaryEntry).where(DiaryEntry.patient_id == pid)
        if date_from is not None:
            stmt = stmt.where(DiaryEntry.recorded_at >= date_from)
        if date_to is not None:
            stmt = stmt.where(DiaryEntry.recorded_at <= date_to)
        stmt = stmt.order_by(DiaryEntry.recorded_at.desc())
        if offset is not None and offset > 0:
            stmt = stmt.offset(offset)
        if limit is not None and limit > 0:
            stmt = stmt.limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def update_entry(self, db: AsyncSession, row: DiaryEntry, data: dict) -> DiaryEntry:
        for key, val in data.items():
            if hasattr(row, key):
                setattr(row, key, val)
        await db.commit()
        await db.refresh(row)
        return row

    async def delete_entry(self, db: AsyncSession, row: DiaryEntry) -> None:
        await db.delete(row)
        await db.commit()

    async def exists_duplicate(self, db: AsyncSession, patient_id: str, device_id: str, recorded_at: datetime) -> bool:
        try:
            pid = uuid.UUID(str(patient_id))
        except ValueError:
            return False
        stmt = select(DiaryEntry.id).where(
            DiaryEntry.patient_id == pid,
            DiaryEntry.device_id == device_id,
            DiaryEntry.recorded_at == recorded_at,
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none() is not None