"""Diagnosis service."""

from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import forbidden, not_found
from app.models.profile import PatientProfile, PractitionerProfile
from app.repositories.diagnosis_repository import DiagnosisRepository
from app.schemas.diagnosis import DiagnosisCreate, DiagnosisResponse, DiagnosisUpdate
from app.services import audit_service


class DiagnosisService:
    def __init__(self, repository: DiagnosisRepository | None = None):
        self.repository = repository or DiagnosisRepository()

    def _to_response(self, row) -> dict:
        return {
            "id": str(row.id),
            "patient_id": str(row.patient_id),
            "coding_system": row.coding_system,
            "code": row.code,
            "title": row.title,
            "is_primary": row.is_primary,
            "status": row.status,
            "diagnosed_at": row.diagnosed_at.isoformat() if row.diagnosed_at else None,
            "ended_at": row.ended_at.isoformat() if row.ended_at else None,
            "diagnosed_by": str(row.diagnosed_by) if row.diagnosed_by else None,
            "is_confirmed": row.is_confirmed,
            "notes": row.notes,
        }

    async def _patient_profile_id(self, db: AsyncSession, user) -> Optional[str]:
        if getattr(user, "role", None) != "patient":
            return None
        profile = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))).scalar_one_or_none()
        return str(profile.id) if profile else None

    async def _practitioner_clinic_ids(self, db, user) -> list[str]:
        from app.services.clinic_isolation import practitioner_clinic_ids
        return await practitioner_clinic_ids(db, user)

    async def _patient_clinic_id(self, db, patient_id) -> Optional[str]:
        try:
            pid = uuid.UUID(str(patient_id))
        except (ValueError, AttributeError):
            return None
        profile = (await db.execute(select(PatientProfile).where(PatientProfile.id == pid))).scalar_one_or_none()
        return str(profile.clinic_id) if profile and profile.clinic_id else None

    async def create_diagnosis(self, db: AsyncSession, current_user, data: Dict[str, Any]) -> dict:
        if getattr(current_user, "role", None) not in ("doctor", "super_admin"):
            raise forbidden()
        payload = dict(data)
        # clinic isolation
        if getattr(current_user, "role", None) != "super_admin":
            p_clinics = await self._practitioner_clinic_ids(db, current_user)
            pat_clinic = await self._patient_clinic_id(db, payload.get("patient_id"))
            if p_clinics and pat_clinic is not None and pat_clinic not in p_clinics:
                raise forbidden()
        payload["diagnosed_by"] = str(current_user.id)
        row = await self.repository.create(db, payload)
        await audit_service.record(db, user_id=current_user.id, action="patient.update", entity_type="PatientDiagnosis", entity_id=row.id, new_values={"coding_system": row.coding_system, "code": row.code})
        await db.commit()
        return self._to_response(row)

    async def get_diagnosis(self, db: AsyncSession, diagnosis_id: str, current_user) -> dict:
        row = await self.repository.get_by_id(db, diagnosis_id)
        if row is None:
            raise not_found("Диагноз не найден")
        if getattr(current_user, "role", None) == "patient":
            own = await self._patient_profile_id(db, current_user)
            if own != str(row.patient_id):
                raise forbidden()
        return self._to_response(row)

    async def update_diagnosis(self, db: AsyncSession, diagnosis_id: str, data: Dict[str, Any], current_user) -> dict:
        if getattr(current_user, "role", None) not in ("doctor", "super_admin"):
            raise forbidden()
        row = await self.repository.get_by_id(db, diagnosis_id)
        if row is None:
            raise not_found("Диагноз не найден")
        # clinic isolation
        if getattr(current_user, "role", None) != "super_admin":
            p_clinics = await self._practitioner_clinic_ids(db, current_user)
            pat_clinic = await self._patient_clinic_id(db, row.patient_id)
            if p_clinics and pat_clinic is not None and pat_clinic not in p_clinics:
                raise forbidden()
        old = {"status": row.status, "is_primary": row.is_primary}
        updated = await self.repository.update(db, diagnosis_id, data)
        await audit_service.record(db, user_id=current_user.id, action="patient.update", entity_type="PatientDiagnosis", entity_id=updated.id, old_values=old, new_values=data)
        await db.commit()
        return self._to_response(updated)

    async def list_patient_diagnoses(self, db: AsyncSession, patient_id: str, current_user, coding_system: str | None = None) -> dict:
        if getattr(current_user, "role", None) == "patient":
            own = await self._patient_profile_id(db, current_user)
            if own != str(patient_id):
                raise forbidden()
        rows = await self.repository.list_by_patient(db, patient_id, coding_system)
        return {"items": [self._to_response(r) for r in rows], "total": len(rows)}

    async def list_diagnoses(self, db: AsyncSession, current_user, patient_id: Optional[str] = None, coding_system: str | None = None) -> dict:
        if getattr(current_user, "role", None) == "patient":
            own = await self._patient_profile_id(db, current_user)
            if own is None:
                return {"items": [], "total": 0}
            if patient_id and patient_id != own:
                raise forbidden()
            patient_id = own
        clinic_ids = None
        if getattr(current_user, "role", None) not in ("patient", "super_admin") and not patient_id:
            clinic_ids = await self._practitioner_clinic_ids(db, current_user)
            if not clinic_ids:
                return {"items": [], "total": 0}
        if patient_id:
            rows = await self.repository.list_by_patient(db, patient_id, coding_system)
        else:
            rows = await self.repository.list_all(db, coding_system, clinic_ids)
        return {"items": [self._to_response(r) for r in rows], "total": len(rows)}
