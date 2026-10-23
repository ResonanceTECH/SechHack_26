"""Medication repository."""
from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.medication import Medication, Prescription, MedicationAdherence


class MedicationRepository:
    async def create_medication(self, db: AsyncSession, data: dict) -> Medication:
        row = Medication(
            name=data["name"],
            international_name=data.get("international_name"),
            dosage_form=data.get("dosage_form"),
            strength=data.get("strength"),
            manufacturer=data.get("manufacturer"),
            instructions_url=data.get("instructions_url"),
            contraindications=data.get("contraindications"),
            side_effects=data.get("side_effects"),
            interactions=data.get("interactions"),
            patient_instruction=data.get("patient_instruction"),
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_medication(self, db: AsyncSession, medication_id: str) -> Medication | None:
        try:
            mid = uuid.UUID(str(medication_id))
        except ValueError:
            return None
        return (await db.execute(select(Medication).where(Medication.id == mid))).scalar_one_or_none()

    async def list_medications(self, db: AsyncSession, search: str | None = None) -> list[Medication]:
        q = select(Medication)
        if search:
            q = q.where(Medication.name.ilike(f"%{search}%"))
        q = q.order_by(Medication.name.asc())
        return list((await db.execute(q)).scalars().all())

    async def update_medication(self, db: AsyncSession, medication_id: str, data: dict) -> Medication | None:
        row = await self.get_medication(db, medication_id)
        if row is None:
            return None
        for key, value in data.items():
            if value is None:
                continue
            if hasattr(row, key):
                setattr(row, key, value)
        await db.commit()
        await db.refresh(row)
        return row

    async def delete_medication(self, db: AsyncSession, medication_id: str) -> bool:
        row = await self.get_medication(db, medication_id)
        if row is None:
            return False
        await db.delete(row)
        await db.commit()
        return True

    async def create_prescription(self, db: AsyncSession, data: dict) -> Prescription:
        row = Prescription(
            patient_id=uuid.UUID(str(data["patient_id"])),
            practitioner_id=uuid.UUID(str(data["practitioner_id"])),
            medication_id=uuid.UUID(str(data["medication_id"])),
            dosage=data["dosage"],
            frequency=data["frequency"],
            start_date=data["start_date"],
            end_date=data["end_date"],
            is_active=bool(data.get("is_active", True)),
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_prescription(self, db: AsyncSession, prescription_id: str) -> Prescription | None:
        try:
            pid = uuid.UUID(str(prescription_id))
        except ValueError:
            return None
        return (await db.execute(select(Prescription).where(Prescription.id == pid))).scalar_one_or_none()

    async def list_prescriptions(self, db: AsyncSession, patient_id: str | None = None) -> list[Prescription]:
        q = select(Prescription)
        if patient_id:
            try:
                pid = uuid.UUID(str(patient_id))
            except ValueError:
                return []
            q = q.where(Prescription.patient_id == pid)
        q = q.order_by(Prescription.created_at.desc())
        return list((await db.execute(q)).scalars().all())


    async def update_prescription(self, db: AsyncSession, prescription_id: str, data: dict) -> Prescription | None:
        row = await self.get_prescription(db, prescription_id)
        if row is None:
            return None
        for key, value in data.items():
            if value is None:
                continue
            if key in ("patient_id", "practitioner_id", "medication_id"):
                value = uuid.UUID(str(value))
            if hasattr(row, key):
                setattr(row, key, value)
        await db.commit()
        await db.refresh(row)
        return row

    async def create_adherence(self, db: AsyncSession, data: dict) -> MedicationAdherence:
        row = MedicationAdherence(
            prescription_id=uuid.UUID(str(data["prescription_id"])),
            taken_at=data["taken_at"],
            is_taken=bool(data["is_taken"]),
            note=data.get("note"),
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def list_adherence(self, db: AsyncSession, prescription_id: str) -> list[MedicationAdherence]:
        try:
            pid = uuid.UUID(str(prescription_id))
        except ValueError:
            return []
        q = select(MedicationAdherence).where(MedicationAdherence.prescription_id == pid).order_by(MedicationAdherence.taken_at.desc())
        return list((await db.execute(q)).scalars().all())

    async def adherence_rate(self, db: AsyncSession, prescription_id: str) -> float | None:
        try:
            pid = uuid.UUID(str(prescription_id))
        except ValueError:
            return None
        total = (await db.execute(select(func.count()).select_from(MedicationAdherence).where(MedicationAdherence.prescription_id == pid))).scalar_one()
        if total == 0:
            return None
        taken = (await db.execute(select(func.count()).select_from(MedicationAdherence).where(MedicationAdherence.prescription_id == pid, MedicationAdherence.is_taken.is_(True)))).scalar_one()
        return round(taken / total, 4)
