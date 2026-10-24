"""Exercise service."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.care import CarePlan, ExerciseAssignment
from app.models.profile import PatientProfile, PractitionerProfile
from app.repositories.exercise_repository import ExerciseRepository


class ExerciseService:
    def __init__(self, repo: ExerciseRepository | None = None):
        self.repo = repo or ExerciseRepository()

    async def _practitioner_profile(self, db: AsyncSession, user) -> PractitionerProfile | None:
        res = await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == uuid.UUID(str(user.id))))
        return res.scalar_one_or_none()

    async def _patient_profile(self, db: AsyncSession, user) -> PatientProfile | None:
        res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == uuid.UUID(str(user.id))))
        return res.scalar_one_or_none()

    # Care plans
    async def create_care_plan(self, db: AsyncSession, current_user, data: dict) -> CarePlan:
        prof = await self._practitioner_profile(db, current_user)
        if prof is None:
            raise ValueError("Practitioner profile not found")
        data = dict(data)
        data["practitioner_id"] = str(prof.id)
        return await self.repo.create_care_plan(db, data)

    async def list_care_plans(self, db: AsyncSession, current_user, patient_id: str | None = None) -> list[CarePlan]:
        if getattr(current_user, "role", "") == "patient":
            prof = await self._patient_profile(db, current_user)
            if prof is None:
                return []
            patient_id = str(prof.id)
        return await self.repo.list_care_plans(db, patient_id)

    # Exercises (assignments)
    async def list_exercises(self, db: AsyncSession, current_user, patient_id: str | None = None) -> list[ExerciseAssignment]:
        if getattr(current_user, "role", "") == "patient":
            prof = await self._patient_profile(db, current_user)
            if prof is None:
                return []
            patient_id = str(prof.id)
        items = await self.repo.list_assignments(db, patient_id=patient_id)
        # attach patient_id via care plan lazily not needed
        return items

    async def create_exercise(self, db: AsyncSession, current_user, data: dict) -> ExerciseAssignment:
        prof = await self._practitioner_profile(db, current_user)
        if prof is None:
            raise ValueError("Practitioner profile not found")
        # resolve patient_id
        patient_id = data.get("patient_id")
        if not patient_id:
            raise ValueError("patient_id required")
        # care plan
        care_plan_id = data.get("care_plan_id")
        if not care_plan_id:
            cp = await self.repo.create_care_plan(db, {
                "patient_id": patient_id,
                "practitioner_id": str(prof.id),
                "title": "Care plan",
            })
            care_plan_id = str(cp.id)
        return await self.repo.create_assignment(db, {
            "care_plan_id": care_plan_id,
            "exercise_type": data["exercise_type"],
            "payload": data.get("payload"),
            "scheduled_for": data.get("scheduled_for"),
            "due_at": data.get("due_at"),
        })

    async def get_assignment(self, db: AsyncSession, assignment_id: str) -> ExerciseAssignment | None:
        return await self.repo.get_assignment(db, assignment_id)

    async def update_exercise(self, db: AsyncSession, assignment_id: str, data: dict) -> ExerciseAssignment | None:
        return await self.repo.update_assignment(db, assignment_id, data)

    async def complete_exercise(self, db: AsyncSession, current_user, assignment_id: str, data: dict) -> ExerciseCompletion:
        prof = await self._patient_profile(db, current_user)
        if prof is None:
            raise ValueError("Patient profile not found")
        data = dict(data)
        data["assignment_id"] = assignment_id
        data["patient_id"] = str(prof.id)
        return await self.repo.create_completion(db, data)

    async def compliance(self, db: AsyncSession, assignment_id: str) -> dict:
        return await self.repo.compliance(db, assignment_id)
