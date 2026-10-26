"""Exercise service."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.care import CarePlan, ExerciseAssignment, ExerciseCompletion
from app.models.profile import PatientProfile, PractitionerProfile
from app.repositories.exercise_repository import ExerciseRepository
from app.services.clinic_isolation import practitioner_clinic_ids, patient_clinic_id, enforce_clinic_match


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
        role = getattr(current_user, "role", None)
        if role not in ("patient", "super_admin"):
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics:
                pat_clinic = await patient_clinic_id(db, data.get("patient_id"))
                enforce_clinic_match(p_clinics, pat_clinic)
        return await self.repo.create_care_plan(db, data)

    async def list_care_plans(self, db: AsyncSession, current_user, patient_id: str | None = None) -> list[CarePlan]:
        if getattr(current_user, "role", "") == "patient":
            prof = await self._patient_profile(db, current_user)
            if prof is None:
                return []
            patient_id = str(prof.id)
        items = await self.repo.list_care_plans(db, patient_id)
        role = getattr(current_user, "role", None)
        if role not in ("patient", "super_admin"):
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics:
                filtered = []
                for cp in items:
                    pc = await patient_clinic_id(db, str(cp.patient_id))
                    if pc is None or pc in p_clinics:
                        filtered.append(cp)
                items = filtered
        return items

    async def update_care_plan(self, db: AsyncSession, care_plan_id: str, data: dict, current_user=None) -> CarePlan | None:
        row = await self.repo.get_care_plan(db, care_plan_id)
        if row is None:
            return None
        if current_user is not None and getattr(current_user, "role", None) not in ("patient", "super_admin"):
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics:
                pc = await patient_clinic_id(db, str(row.patient_id))
                if pc is not None and pc not in p_clinics:
                    from app.core.errors import forbidden
                    raise forbidden()
        from app.services.version_service import EntityVersionService
        await EntityVersionService().record(
            db, entity_type="care_plan", entity_id=str(row.id),
            changed_by=str(current_user.id) if current_user is not None else None,
            reason="update", is_addendum=False,
            snapshot={"id": str(row.id), "patient_id": str(row.patient_id), "practitioner_id": str(row.practitioner_id), "title": row.title, "description": row.description, "status": row.status},
        )
        return await self.repo.update_care_plan(db, care_plan_id, data)

    # Exercises (assignments)
    async def list_exercises(self, db: AsyncSession, current_user, patient_id: str | None = None) -> list[ExerciseAssignment]:
        if getattr(current_user, "role", "") == "patient":
            prof = await self._patient_profile(db, current_user)
            if prof is None:
                return []
            patient_id = str(prof.id)
        items = await self.repo.list_assignments(db, patient_id=patient_id)
        # clinic isolation filter applied below
        role = getattr(current_user, "role", None)
        if role not in ("patient", "super_admin"):
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics:
                filtered = []
                for a in items:
                    cp = await self.repo.get_care_plan(db, str(a.care_plan_id))
                    if cp is None:
                        continue
                    pc = await patient_clinic_id(db, str(cp.patient_id))
                    if pc is None or pc in p_clinics:
                        filtered.append(a)
                items = filtered
        role = getattr(current_user, "role", None)
        if role not in ("patient", "super_admin"):
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics:
                pat_clinic = await patient_clinic_id(db, patient_id)
                enforce_clinic_match(p_clinics, pat_clinic)

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
        role = getattr(current_user, "role", None)
        if role not in ("patient", "super_admin"):
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics:
                pat_clinic = await patient_clinic_id(db, patient_id)
                enforce_clinic_match(p_clinics, pat_clinic)
        return await self.repo.create_assignment(db, {
            "care_plan_id": care_plan_id,
            "exercise_type": data["exercise_type"],
            "payload": data.get("payload"),
            "scheduled_for": data.get("scheduled_for"),
            "due_at": data.get("due_at"),
        })

    async def get_assignment(self, db: AsyncSession, assignment_id: str) -> ExerciseAssignment | None:
        return await self.repo.get_assignment(db, assignment_id)

    async def update_exercise(self, db: AsyncSession, assignment_id: str, data: dict, current_user=None) -> ExerciseAssignment | None:
        row = await self.repo.get_assignment(db, assignment_id)
        if row is None:
            return None
        if current_user is not None:
            role = getattr(current_user, "role", None)
            if role not in ("patient", "super_admin"):
                cp = await self.repo.get_care_plan(db, str(row.care_plan_id))
                patient_id = str(cp.patient_id) if cp else None
                p_clinics = await practitioner_clinic_ids(db, current_user)
                if p_clinics and patient_id is not None:
                    pat_clinic = await patient_clinic_id(db, patient_id)
                    enforce_clinic_match(p_clinics, pat_clinic)
        from app.services.version_service import EntityVersionService
        await EntityVersionService().record(
            db, entity_type="exercise_assignment", entity_id=str(row.id),
            changed_by=str(getattr(current_user, "id", "")) if current_user is not None else "",
            reason="update", is_addendum=False,
            snapshot={
                "id": str(row.id),
                "care_plan_id": str(row.care_plan_id),
                "exercise_type": row.exercise_type,
                "payload": row.payload,
                "scheduled_for": row.scheduled_for.isoformat() if row.scheduled_for is not None else None,
                "due_at": row.due_at.isoformat() if row.due_at is not None else None,
                "created_at": row.created_at.isoformat() if getattr(row, "created_at", None) else None,
                "updated_at": row.updated_at.isoformat() if getattr(row, "updated_at", None) else None,
            },
        )
        return await self.repo.update_assignment(db, assignment_id, data)

    async def complete_exercise(self, db: AsyncSession, current_user, assignment_id: str, data: dict) -> ExerciseCompletion:
        prof = await self._patient_profile(db, current_user)
        if prof is None:
            raise ValueError("Patient profile not found")
        data = dict(data)
        data["assignment_id"] = assignment_id
        data["patient_id"] = str(prof.id)
        return await self.repo.create_completion(db, data)

    async def compliance(self, db: AsyncSession, assignment_id: str, current_user=None) -> dict:
        row = await self.repo.get_assignment(db, assignment_id)
        if row is not None and current_user is not None:
            role = getattr(current_user, "role", None)
            if role not in ("patient", "super_admin"):
                cp = await self.repo.get_care_plan(db, str(row.care_plan_id))
                patient_id = str(cp.patient_id) if cp else None
                p_clinics = await practitioner_clinic_ids(db, current_user)
                if p_clinics and patient_id is not None:
                    pat_clinic = await patient_clinic_id(db, patient_id)
                    enforce_clinic_match(p_clinics, pat_clinic)
        return await self.repo.compliance(db, assignment_id)
