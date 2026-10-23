from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import not_found
from app.models.care import CarePlan, ExerciseAssignment, ExerciseCompletion
from app.repositories.assessment_plan_repository import AssessmentPlanRepository
from app.repositories.diagnosis_repository import DiagnosisRepository
from app.repositories.patient_repository import PatientRepository
from app.schemas.patient import PatientUpdate
from app.services.assessment_plan_service import AssessmentPlanService


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
        result = await self.repository.get_patient_summary(db, patient_id, current_user)
        if not result:
            raise not_found("Пациент не найден")

        diagnoses = await DiagnosisRepository().list_by_patient(db, patient_id)
        result["diagnoses"] = {
            "active": [d.code for d in diagnoses if d.status == "active"],
            "primary": next((d.code for d in diagnoses if d.is_primary and d.status == "active"), None),
            "total": len(diagnoses),
        }

        assessment = await AssessmentPlanService(AssessmentPlanRepository()).patient_summary_assessment(db, patient_id)
        result["assessment"] = assessment

        # Adherence block — care plan / exercise completion stats
        try:
            pid = UUID(str(patient_id))
        except (ValueError, AttributeError):
            pid = None

        active_care_plans = 0
        total_assignments = 0
        completed_assignments = 0
        latest_completion_at = None
        if pid is not None:
            active_care_plans = (await db.execute(
                select(func.count()).select_from(CarePlan).where(
                    CarePlan.patient_id == pid,
                    CarePlan.status == "active",
                )
            )).scalar_one()

            total_assignments = (await db.execute(
                select(func.count()).select_from(ExerciseAssignment).join(
                    CarePlan, ExerciseAssignment.care_plan_id == CarePlan.id
                ).where(CarePlan.patient_id == pid)
            )).scalar_one()

            completed_assignments = (await db.execute(
                select(func.count()).select_from(ExerciseCompletion).where(
                    ExerciseCompletion.patient_id == pid,
                    ExerciseCompletion.completed.is_(True),
                )
            )).scalar_one()

            latest = (await db.execute(
                select(ExerciseCompletion.created_at).where(
                    ExerciseCompletion.patient_id == pid
                ).order_by(ExerciseCompletion.created_at.desc()).limit(1)
            )).scalar_one_or_none()
            if latest is not None:
                latest_completion_at = latest.isoformat()

        adherence_rate = (
            round(completed_assignments / total_assignments * 100) if total_assignments else 0
        )
        result["adherence"] = {
            "active_care_plans": active_care_plans,
            "total_assignments": total_assignments,
            "completed_assignments": completed_assignments,
            "adherence_rate": adherence_rate,
            "latest_completion_at": latest_completion_at,
        }
        return result
