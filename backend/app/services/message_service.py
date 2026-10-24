"""Message service."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import PatientProfile
from app.repositories.message_repository import MessageRepository
from app.services.clinic_isolation import practitioner_clinic_id, patient_clinic_id, enforce_clinic_match


class MessageService:
    def __init__(self, repo: MessageRepository | None = None):
        self.repo = repo or MessageRepository()

    async def _patient_profile(self, db: AsyncSession, user) -> PatientProfile | None:
        res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == uuid.UUID(str(user.id))))
        return res.scalar_one_or_none()

    async def create_message(self, db: AsyncSession, current_user, data: dict) -> "Message":
        data = dict(data)
        data["sender_id"] = str(current_user.id)
        role = getattr(current_user, "role", "")
        if role not in ("patient", "super_admin"):
            p_clinic = await practitioner_clinic_id(db, current_user)
            if p_clinic is not None:
                pid = data.get("patient_id")
                if pid is not None:
                    pat_clinic = await patient_clinic_id(db, pid)
                    enforce_clinic_match(p_clinic, pat_clinic)
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
        items = await self.repo.list_messages(db, patient_id=patient_id, user_id=str(current_user.id), only_for_user=False)
        role = getattr(current_user, "role", "")
        if role not in ("patient", "super_admin"):
            p_clinic = await practitioner_clinic_id(db, current_user)
            if p_clinic is not None:
                filtered = []
                for m in items:
                    mid = getattr(m, "patient_id", None)
                    if mid is None:
                        filtered.append(m)
                        continue
                    pat_clinic = await patient_clinic_id(db, mid)
                    if pat_clinic is None or pat_clinic == p_clinic:
                        filtered.append(m)
                items = filtered
        return items

    async def get_message(self, db: AsyncSession, current_user, message_id: str):
        row = await self.repo.get_message(db, message_id)
        if row is None:
            return None
        role = getattr(current_user, "role", "")
        if role not in ("patient", "super_admin"):
            p_clinic = await practitioner_clinic_id(db, current_user)
            if p_clinic is not None:
                mid = getattr(row, "patient_id", None)
                if mid is not None:
                    pat_clinic = await patient_clinic_id(db, mid)
                    if pat_clinic is not None and pat_clinic != p_clinic:
                        from app.core.errors import forbidden
                        raise forbidden("Clinic isolation violation")
        return row

    async def mark_read(self, db: AsyncSession, current_user, message_id: str):
        row = await self.repo.get_message(db, message_id)
        if row is None:
            return None
        role = getattr(current_user, "role", "")
        if role not in ("patient", "super_admin"):
            p_clinic = await practitioner_clinic_id(db, current_user)
            if p_clinic is not None:
                mid = getattr(row, "patient_id", None)
                if mid is not None:
                    pat_clinic = await patient_clinic_id(db, mid)
                    if pat_clinic is not None and pat_clinic != p_clinic:
                        from app.core.errors import forbidden
                        raise forbidden("Clinic isolation violation")
        return await self.repo.mark_read(db, message_id)
