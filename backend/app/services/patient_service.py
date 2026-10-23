from __future__ import annotations

from typing import List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.patient_repository import PatientRepository
from app.schemas.patient import PatientListItem, PatientDetail, PatientUpdate
from app.core.errors import not_found, forbidden


class PatientService:
    """Patient service containing business logic.

    Orchestrates patient operations: RBAC validation, clinic isolation, and coordination
    between repository and schemas. All business logic lives here; routers are thin.
    """

    def __init__(self, repository: PatientRepository):
        self.repository = repository

    async def list_patients(
        self,
        db: AsyncSession,
        current_user: object,
    ) -> dict:
        """List patients based on user RBAC role."""
        result = await self.repository.get_patients_by_user(db, str(getattr(current_user, "id", "")), current_user)
        return {"patients": result}

    async def get_patient(
        self,
        db: AsyncSession,
        patient_id: str,
        current_user: object,
    ) -> dict:
        """Get patient detail by ID with RBAC validation."""
        from app.core.errors import not_found
        result = await self.repository.get_patient_by_id(db, patient_id, current_user)
        if not result:
            raise not_found("Пациент не найден")
        return result

    async def update_patient(
        self,
        db: AsyncSession,
        patient_id: str,
        body: PatientUpdate,
        current_user: object,
    ) -> dict:
        """Update patient data with RBAC validation."""
        from app.core.errors import not_found
        data = body.model_dump(exclude_unset=True)
        result = await self.repository.update_patient(db, patient_id, data, current_user)
        if not result:
            raise not_found("Пациент не найден")
        return result

    async def get_patient_summary(
        self,
        db: AsyncSession,
        patient_id: str,
        current_user: object,
    ) -> dict:
        """Get patient summary for MVP endpoint."""
        from app.core.errors import not_found
        result = await self.repository.get_patient_summary(db, patient_id, current_user)
        if not result:
            raise not_found("Пациент не найден")
        from app.repositories.diagnosis_repository import DiagnosisRepository
        diagnoses = await DiagnosisRepository().list_by_patient(db, patient_id)
        result["diagnoses"] = {
            "active": [d.code for d in diagnoses if d.status == "active"],
            "primary": next((d.code for d in diagnoses if d.is_primary and d.status == "active"), None),
            "total": len(diagnoses),
        }
        from app.services.assessment_plan_service import AssessmentPlanService
        from app.repositories.assessment_plan_repository import AssessmentPlanRepository

        assessment = await AssessmentPlanService(AssessmentPlanRepository()).patient_summary_assessment(db, patient_id)
        result["assessment"] = assessment
        return result
