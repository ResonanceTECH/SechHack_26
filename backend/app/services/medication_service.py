"""Medication service."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import has_permission
from app.models.medication import Medication, Prescription, MedicationAdherence
from app.models.profile import PatientProfile, PractitionerProfile
from app.repositories.medication_repository import MedicationRepository
from app.services.clinic_isolation import practitioner_clinic_id, patient_clinic_id, enforce_clinic_match


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
        from app.models.profile import PractitionerProfile
        res = await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == uuid.UUID(str(current_user.id))))
        prof = res.scalar_one_or_none()
        if prof is None:
            raise ValueError("Practitioner profile not found")
        data = dict(data)
        data["practitioner_id"] = str(prof.id)
        role = getattr(current_user, "role", "")
        if role not in ("patient", "super_admin"):
            p_clinic = await practitioner_clinic_id(db, current_user)
            if p_clinic is not None:
                pat_clinic = await patient_clinic_id(db, data.get("patient_id"))
                enforce_clinic_match(p_clinic, pat_clinic)
        return await self.repo.create_prescription(db, data)

    async def list_prescriptions(self, db: AsyncSession, current_user, patient_id: str | None = None) -> list[Prescription]:
        if getattr(current_user, "role", "") == "patient":
            from app.models.profile import PatientProfile
            res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == uuid.UUID(str(current_user.id))))
            prof = res.scalar_one_or_none()
            if prof is None:
                return []
            patient_id = str(prof.id)
        items = await self.repo.list_prescriptions(db, patient_id)
        role = getattr(current_user, "role", "")
        if role not in ("patient", "super_admin"):
            p_clinic = await practitioner_clinic_id(db, current_user)
            if p_clinic is not None:
                filtered = []
                for p in items:
                    pat_clinic = await patient_clinic_id(db, p.patient_id)
                    if pat_clinic is None or pat_clinic == p_clinic:
                        filtered.append(p)
                items = filtered
        return items

    async def get_prescription(self, db: AsyncSession, current_user, prescription_id: str) -> Prescription | None:
        row = await self.repo.get_prescription(db, prescription_id)
        if row is None:
            return None
        role = getattr(current_user, "role", "")
        if role not in ("patient", "super_admin"):
            p_clinic = await practitioner_clinic_id(db, current_user)
            if p_clinic is not None:
                pat_clinic = await patient_clinic_id(db, row.patient_id)
                if pat_clinic is not None and pat_clinic != p_clinic:
                    from app.core.errors import forbidden
                    raise forbidden("Clinic isolation violation")
        return row

    async def update_prescription(self, db: AsyncSession, current_user, prescription_id: str, data: dict) -> Prescription | None:
        row = await self.repo.get_prescription(db, prescription_id)
        if row is not None:
            role = getattr(current_user, "role", "")
            if role not in ("patient", "super_admin"):
                p_clinic = await practitioner_clinic_id(db, current_user)
                if p_clinic is not None:
                    pat_clinic = await patient_clinic_id(db, row.patient_id)
                    if pat_clinic is not None and pat_clinic != p_clinic:
                        from app.core.errors import forbidden
                        raise forbidden("Clinic isolation violation")
        return await self.repo.update_prescription(db, prescription_id, data)

    async def deactivate_prescription(self, db: AsyncSession, current_user, prescription_id: str) -> Prescription | None:
        row = await self.repo.get_prescription(db, prescription_id)
        if row is not None:
            role = getattr(current_user, "role", "")
            if role not in ("patient", "super_admin"):
                p_clinic = await practitioner_clinic_id(db, current_user)
                if p_clinic is not None:
                    pat_clinic = await patient_clinic_id(db, row.patient_id)
                    if pat_clinic is not None and pat_clinic != p_clinic:
                        from app.core.errors import forbidden
                        raise forbidden("Clinic isolation violation")
        return await self.repo.deactivate_prescription(db, prescription_id)

    # Adherence
    async def create_adherence(self, db: AsyncSession, current_user, data: dict) -> MedicationAdherence:
        presc = await self.repo.get_prescription(db, str(data.get("prescription_id")))
        if presc is not None:
            role = getattr(current_user, "role", "")
            if role not in ("patient", "super_admin"):
                p_clinic = await practitioner_clinic_id(db, current_user)
                if p_clinic is not None:
                    pat_clinic = await patient_clinic_id(db, presc.patient_id)
                    enforce_clinic_match(p_clinic, pat_clinic)
        return await self.repo.create_adherence(db, data)

    async def list_adherence(self, db: AsyncSession, current_user, prescription_id: str) -> list[MedicationAdherence]:
        presc = await self.repo.get_prescription(db, prescription_id)
        if presc is not None:
            role = getattr(current_user, "role", "")
            if role not in ("patient", "super_admin"):
                p_clinic = await practitioner_clinic_id(db, current_user)
                if p_clinic is not None:
                    pat_clinic = await patient_clinic_id(db, presc.patient_id)
                    enforce_clinic_match(p_clinic, pat_clinic)
        return await self.repo.list_adherence(db, prescription_id)

    async def update_adherence(self, db: AsyncSession, adherence_id: str, data: dict, corrected_by: str | None = None) -> MedicationAdherence | None:
        return await self.repo.update_adherence(db, adherence_id, data, corrected_by=corrected_by)

    async def adherence_rate(self, db: AsyncSession, current_user, prescription_id: str) -> float | None:
        presc = await self.repo.get_prescription(db, prescription_id)
        if presc is not None:
            role = getattr(current_user, "role", "")
            if role not in ("patient", "super_admin"):
                p_clinic = await practitioner_clinic_id(db, current_user)
                if p_clinic is not None:
                    pat_clinic = await patient_clinic_id(db, presc.patient_id)
                    enforce_clinic_match(p_clinic, pat_clinic)
        return await self.repo.adherence_rate(db, prescription_id)
