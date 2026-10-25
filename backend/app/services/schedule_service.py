"""Schedule service."""

from __future__ import annotations

import uuid
from datetime import date, time

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.schedule_repository import ScheduleRepository
from app.services.clinic_isolation import practitioner_clinic_ids


class ScheduleService:
    def __init__(self, repo: ScheduleRepository | None = None):
        self.repo = repo or ScheduleRepository()

    async def get_clinic_settings(self, db: AsyncSession, clinic_id: str, current_user=None):
        if current_user is not None:
            role = getattr(current_user, "role", None)
            if role not in ("super_admin",):
                p_clinics = await practitioner_clinic_ids(db, current_user)
                if p_clinics and p_clinic != str(clinic_id):
                    from app.core.errors import forbidden
                    raise forbidden("Clinic isolation violation")
        return await self.repo.get_clinic_settings(db, uuid.UUID(clinic_id))

    async def update_clinic_settings(self, db: AsyncSession, clinic_id: str, timezone: str, current_user=None):
        if current_user is not None:
            role = getattr(current_user, "role", None)
            if role not in ("super_admin",):
                p_clinics = await practitioner_clinic_ids(db, current_user)
                if p_clinics and p_clinic != str(clinic_id):
                    from app.core.errors import forbidden
                    raise forbidden("Clinic isolation violation")
        return await self.repo.upsert_clinic_settings(db, uuid.UUID(clinic_id), timezone)

    async def get_schedule(self, db: AsyncSession, practitioner_id: str, current_user=None):
        if current_user is not None:
            role = getattr(current_user, "role", None)
            if role not in ("super_admin",):
                from app.models.profile import PractitionerProfile
                res = await db.execute(select(PractitionerProfile).where(PractitionerProfile.id == uuid.UUID(practitioner_id)))
                prof = res.scalar_one_or_none()
                p_clinics = await practitioner_clinic_ids(db, current_user)
                if p_clinics and prof is not None and str(prof.clinic_id) not in p_clinics:
                    from app.core.errors import forbidden
                    raise forbidden("Clinic isolation violation")
        return await self.repo.list_schedule(db, uuid.UUID(practitioner_id))

    async def replace_schedule(self, db: AsyncSession, practitioner_id: str, entries: list[dict], current_user=None):
        if current_user is not None:
            role = getattr(current_user, "role", None)
            if role not in ("super_admin",):
                from app.models.profile import PractitionerProfile
                res = await db.execute(select(PractitionerProfile).where(PractitionerProfile.id == uuid.UUID(practitioner_id)))
                prof = res.scalar_one_or_none()
                p_clinics = await practitioner_clinic_ids(db, current_user)
                if p_clinics and prof is not None and str(prof.clinic_id) not in p_clinics:
                    from app.core.errors import forbidden
                    raise forbidden("Clinic isolation violation")
        return await self.repo.replace_schedule(db, uuid.UUID(practitioner_id), entries)

    async def add_exception(self, db: AsyncSession, practitioner_id: str, data: dict, current_user=None):
        if current_user is not None:
            role = getattr(current_user, "role", None)
            if role not in ("super_admin",):
                from app.models.profile import PractitionerProfile
                res = await db.execute(select(PractitionerProfile).where(PractitionerProfile.id == uuid.UUID(practitioner_id)))
                prof = res.scalar_one_or_none()
                p_clinics = await practitioner_clinic_ids(db, current_user)
                if p_clinics and prof is not None and str(prof.clinic_id) not in p_clinics:
                    from app.core.errors import forbidden
                    raise forbidden("Clinic isolation violation")
        return await self.repo.add_exception(db, uuid.UUID(practitioner_id), data)

    async def delete_exception(self, db: AsyncSession, exception_id: str):
        await self.repo.delete_exception(db, uuid.UUID(exception_id))
        return True

    async def availability(self, db: AsyncSession, practitioner_id: str, at: str | None = None, current_user=None):
        if current_user is not None:
            role = getattr(current_user, "role", None)
            if role not in ("super_admin",):
                from app.models.profile import PractitionerProfile
                res = await db.execute(select(PractitionerProfile).where(PractitionerProfile.id == uuid.UUID(practitioner_id)))
                prof = res.scalar_one_or_none()
                p_clinics = await practitioner_clinic_ids(db, current_user)
                if p_clinics and prof is not None and str(prof.clinic_id) not in p_clinics:
                    from app.core.errors import forbidden
                    raise forbidden("Clinic isolation violation")
        from datetime import datetime, time, timedelta, timezone

        now = datetime.fromisoformat(at) if at else datetime.now(timezone.utc)
        schedules = await self.get_schedule(db, practitioner_id)
        exceptions = await self.repo.list_exceptions(db, uuid.UUID(practitioner_id))

        def is_available(dt: datetime) -> bool:
            d = dt.date()
            # exception override
            for ex in exceptions:
                if ex.date == d:
                    if ex.start_time is None:
                        return bool(ex.is_available)
                    if ex.start_time <= dt.timetz().replace(tzinfo=None) <= ex.end_time and ex.is_available:
                        return True
                    if not ex.is_available:
                        return False
            # weekly
            for s in schedules:
                if s.weekday == d.weekday() and s.is_available:
                    t = dt.timetz().replace(tzinfo=None)
                    if s.start_time <= t <= s.end_time:
                        return True
            return False

        now_avail = is_available(now)

        # next available: search next 7 days at schedule starts
        next_at = None
        for i in range(0, 8):
            day = now.date() + timedelta(days=i)
            # candidate times
            times = set()
            for s in schedules:
                if s.weekday == day.weekday() and s.is_available:
                    times.add(s.start_time)
            for ex in exceptions:
                if ex.date == day and ex.is_available and ex.start_time is not None:
                    times.add(ex.start_time)
            for t in sorted(times):
                cand = datetime.combine(day, t, tzinfo=now.tzinfo)
                if cand >= now and is_available(cand):
                    next_at = cand
                    break
            if next_at:
                break

        return {"is_available_now": now_avail, "next_available_at": next_at.isoformat() if next_at else None}
