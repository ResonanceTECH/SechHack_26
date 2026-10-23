"""Medication service."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import has_permission
from app.models.medication import Medication, Prescription, MedicationAdherence
from app.repositories.medication_repository import MedicationRepository


class MedicationService:
    def __init__(self, repo: MedicationRepository | None = None):
        self.repo = repo or MedicationRepository()

    # Medications catalog
    async def list_medications(self, db: AsyncSession, search: str | None = None) -> list[Medication]:
        return await self.repo.list_medications(db, search)

    async def get_medication(self, db: AsyncSession, medication_id: str) -> Medication | None:
        return await self.repo.get_medication(db, medication_id)

    async def create_medication(self, db: AsyncSession, data: dict) -> Medication:
        return await self.repo.create_medication(db, data)

    async def update_medication(self, db: AsyncSession, medication_id: str, data: dict) -> Medication | None:
        return await self.repo.update_medication(db, medication_id, data)

    async def delete_medication(self, db: AsyncSession, medication_id: str) -> bool:
        return await self.repo.delete_medication(db, medication_id)

    # Prescriptions
    async def create_prescription(self, db: AsyncSession, current_user, data: dict) -> Prescription:
        # resolve practitioner profile id from user
        from app.models.profile import PractitionerProfile
        from sqlalchemy import select
        res = await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == uuid.UUID(str(current_user.id))))
        prof = res.scalar_one_or_none()
        if prof is None:
            raise ValueError("Practitioner profile not found")
        data = dict(data)
        data["practitioner_id"] = str(prof.id)
        return await self.repo.create_prescription(db, data)

    async def list_prescriptions(self, db: AsyncSession, current_user, patient_id: str | None = None) -> list[Prescription]:
        # patients see only own
        if getattr(current_user, "role", "") == "patient":
            # resolve patient profile
            from app.models.profile import PatientProfile
            from sqlalchemy import select
            res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == uuid.UUID(str(current_user.id))))
            prof = res.scalar_one_or_none()
            if prof is None:
                return []
            patient_id = str(prof.id)
        return await self.repo.list_prescriptions(db, patient_id)

    async def get_prescription(self, db: AsyncSession, prescription_id: str) -> Prescription | None:
        return await self.repo.get_prescription(db, prescription_id)

    async def update_prescription(self, db: AsyncSession, prescription_id: str, data: dict) -> Prescription | None:
        return await self.repo.update_prescription(db, prescription_id, data)

    async def deactivate_prescription(self, db: AsyncSession, prescription_id: str) -> Prescription | None:
        return await self.repo.deactivate_prescription(db, prescription_id)

    # Adherence
    async def create_adherence(self, db: AsyncSession, data: dict) -> MedicationAdherence:
        return await self.repo.create_adherence(db, data)

    async def list_adherence(self, db: AsyncSession, prescription_id: str) -> list[MedicationAdherence]:
        return await self.repo.list_adherence(db, prescription_id)

    async def adherence_rate(self, db: AsyncSession, prescription_id: str) -> float | None:
        return await self.repo.adherence_rate(db, prescription_id)
