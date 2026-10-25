"""Schedule repositories."""

from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schedule import ClinicSettings, PractitionerSchedule, PractitionerScheduleException


class ScheduleRepository:
    async def get_clinic_settings(self, db: AsyncSession, clinic_id: uuid.UUID) -> ClinicSettings | None:
        res = await db.execute(select(ClinicSettings).where(ClinicSettings.clinic_id == clinic_id))
        return res.scalar_one_or_none()

    async def upsert_clinic_settings(self, db: AsyncSession, clinic_id: uuid.UUID, timezone: str) -> ClinicSettings:
        row = await self.get_clinic_settings(db, clinic_id)
        if row is None:
            row = ClinicSettings(clinic_id=clinic_id, timezone=timezone)
            db.add(row)
        else:
            row.timezone = timezone
        await db.flush()
        return row

    async def list_schedule(self, db: AsyncSession, practitioner_id: uuid.UUID) -> list[PractitionerSchedule]:
        res = await db.execute(select(PractitionerSchedule).where(PractitionerSchedule.practitioner_id == practitioner_id))
        return list(res.scalars().all())

    async def replace_schedule(self, db: AsyncSession, practitioner_id: uuid.UUID, entries: list[dict]) -> list[PractitionerSchedule]:
        # delete existing
        existing = await db.execute(select(PractitionerSchedule).where(PractitionerSchedule.practitioner_id == practitioner_id))
        for row in existing.scalars().all():
            await db.delete(row)
        await db.flush()
        out = []
        for e in entries:
            row = PractitionerSchedule(
                practitioner_id=practitioner_id,
                weekday=e["weekday"],
                start_time=e["start_time"],
                end_time=e["end_time"],
                is_available=e.get("is_available", True),
            )
            db.add(row)
            out.append(row)
        await db.flush()
        return out

    async def add_exception(self, db: AsyncSession, practitioner_id: uuid.UUID, data: dict) -> PractitionerScheduleException:
        row = PractitionerScheduleException(practitioner_id=practitioner_id, **data)
        db.add(row)
        await db.flush()
        return row

    async def delete_exception(self, db: AsyncSession, exception_id: uuid.UUID) -> None:
        res = await db.execute(select(PractitionerScheduleException).where(PractitionerScheduleException.id == exception_id))
        row = res.scalar_one_or_none()
        if row is not None:
            await db.delete(row)
            await db.flush()

    async def list_exceptions(self, db: AsyncSession, practitioner_id: uuid.UUID) -> list[PractitionerScheduleException]:
        res = await db.execute(select(PractitionerScheduleException).where(PractitionerScheduleException.practitioner_id == practitioner_id))
        return list(res.scalars().all())

    async def get_exception(self, db: AsyncSession, exception_id: uuid.UUID) -> PractitionerScheduleException | None:
        res = await db.execute(select(PractitionerScheduleException).where(PractitionerScheduleException.id == exception_id))
        return res.scalar_one_or_none()

        res = await db.execute(select(PractitionerScheduleException).where(PractitionerScheduleException.id == exception_id))
        return res.scalar_one_or_none()
