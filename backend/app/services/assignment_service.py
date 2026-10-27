"""Assignment service."""
from __future__ import annotations

from app.repositories.assignment_repository import AssignmentRepository
from app.services.clinic_isolation import practitioner_clinic_ids, patient_clinic_id, enforce_clinic_match


class AssignmentService:
    def __init__(self, repo: AssignmentRepository | None = None):
        self.repo = repo or AssignmentRepository()

    async def create(self, db, current_user, data: dict):
        data = dict(data)
        role = getattr(current_user, "role", None)
        if role not in ("patient", "super_admin"):
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics:
                pat_clinic = await patient_clinic_id(db, data.get("patient_id"))
                enforce_clinic_match(p_clinics, pat_clinic)
                data["clinic_id"] = pat_clinic if pat_clinic in p_clinics else p_clinics[0]
        return await self.repo.create(db, data)

    async def list(self, db, current_user, patient_id=None, practitioner_id=None):
        items = await self.repo.list(db, patient_id, practitioner_id)
        role = getattr(current_user, "role", None)
        if role == "patient":
            from app.models.profile import PatientProfile
            from sqlalchemy import select
            import uuid
            res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == uuid.UUID(str(current_user.id))))
            prof = res.scalar_one_or_none()
            if prof is not None:
                items = [a for a in items if str(a.patient_id) == str(prof.id)]
        elif role not in ("super_admin",):
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics:
                allowed = {str(c) for c in p_clinics}
                items = [a for a in items if str(a.clinic_id) in allowed]
        return items

    async def deactivate(self, db, current_user, assignment_id: str):
        row = await self.repo.get(db, assignment_id)
        if row is None:
            return None
        role = getattr(current_user, "role", None)
        if role not in ("patient", "super_admin"):
            p_clinics = await practitioner_clinic_ids(db, current_user)
            if p_clinics and str(row.clinic_id) not in {str(c) for c in p_clinics}:
                from app.core.errors import forbidden
                raise forbidden("Clinic isolation violation")
        return await self.repo.deactivate(db, assignment_id)
