"""Patient repository for database operations.

Handles all patient-related database queries with RBAC and clinic isolation.
Following the pattern: router -> service -> repository -> database
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.assignment import PatientAssignment
from app.models.profile import PatientProfile, PractitionerProfile


class PatientRepository:
    """Repository layer for patient database operations."""

    async def get_patients_by_user(
        self,
        db: AsyncSession,
        user_id: str,
        current_user: User,
    ) -> list:
        """Get patients assigned to current user based on role.

        RBAC rules per AUTH_PLAN.md §5.2:
        - Patient: can only see themselves
        - Doctor/Psychologist: see only patients in their clinic
        - Coordinator/Admin: see all patients
        """
        # Patient role: can only see themselves
        if current_user.role == "patient":
            if current_user.id != user_id:
                from app.core.errors import forbidden
                raise forbidden("Patients can only see their own data")
            # Query own patient profile
            stmt = select(PatientProfile).where(PatientProfile.user_id == user_id)
            result = await db.execute(stmt)
            profile = result.scalar_one_or_none()
            if not profile:
                return []
            return [profile]

        # Doctor/psychologist: see only patients in their clinic
        if current_user.role in ("doctor", "psychologist"):
            # Get practitioner profile for current user
            prac_stmt = select(PractitionerProfile).where(PractitionerProfile.user_id == user_id)
            prac_result = await db.execute(prac_stmt)
            practitioner = prac_result.scalar_one_or_none()

            if not practitioner:
                return []

            # Get practitioner's email
            prac_user_result = await db.execute(select(User).where(User.id == practitioner.user_id))
            practitioner_user = prac_user_result.scalar_one_or_none()
            practitioner_email = practitioner_user.email if practitioner_user else None

            # Query patients assigned to this practitioner via PatientAssignment
            stmt = (
                select(PatientProfile, User)
                .join(User, PatientProfile.user_id == User.id)
                .join(PatientAssignment, PatientAssignment.patient_id == PatientProfile.id)
                .where(
                    PatientAssignment.practitioner_id == practitioner.id,
                    User.role == "patient",
                )
                .order_by(User.email)
            )
            result = await db.execute(stmt)
            patients = []
            for profile, user in result.all():
                patients.append({
                    "id": str(profile.id),
                    "email": user.email,
                    "first_name": profile.first_name,
                    "last_name": profile.last_name,
                    "role": user.role,
                    "clinic_id": str(profile.clinic_id) if profile.clinic_id else None,
                    "assigned_doctor_email": practitioner_email,
                })
            return patients

        # Coordinator/Admin: see all patients
        if current_user.role in ("coordinator", "clinic_admin", "super_admin"):
            stmt = select(PatientProfile, User).join(User, PatientProfile.user_id == User.id).where(User.role == "patient").order_by(User.email)
            result = await db.execute(stmt)
            patients = []
            for profile, user in result.all():
                patients.append({
                    "id": str(profile.id),
                    "email": user.email,
                    "first_name": profile.first_name,
                    "last_name": profile.last_name,
                    "role": user.role,
                    "clinic_id": str(profile.clinic_id) if profile.clinic_id else None,
                    "assigned_doctor_email": None,
                })
            return patients


    async def get_patient_by_id(self, db, patient_id: str, current_user) -> dict | None:
        from uuid import UUID
        try:
            pid = UUID(str(patient_id))
        except ValueError:
            return None
        stmt = select(PatientProfile, User).join(User, PatientProfile.user_id == User.id).where(PatientProfile.id == pid)
        result = await db.execute(stmt)
        row = result.first()
        if not row:
            return None
        profile, user = row
        # RBAC
        if current_user.role == "patient" and str(profile.user_id) != str(current_user.id):
            from app.core.errors import forbidden
            raise forbidden()
        if current_user.role in ("doctor", "psychologist"):
            prac = (await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == current_user.id))).scalar_one_or_none()
            if not prac:
                from app.core.errors import forbidden
                raise forbidden()
            assignment = (await db.execute(select(PatientAssignment).where(
                PatientAssignment.patient_id == profile.id,
                PatientAssignment.practitioner_id == prac.id,
            ))).scalar_one_or_none()
            if not assignment:
                from app.core.errors import forbidden
                raise forbidden()
        return {
            "id": str(profile.id),
            "email": user.email,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "middle_name": profile.middle_name,
            "birth_date": profile.birth_date.isoformat() if profile.birth_date else None,
            "gender": profile.gender,
            "role": user.role,
            "clinic_id": str(profile.clinic_id) if profile.clinic_id else None,
            "created_at": profile.created_at.isoformat() if getattr(profile, "created_at", None) else None,
        }

    async def update_patient(self, db, patient_id: str, data: dict, current_user) -> dict | None:
        from uuid import UUID
        try:
            pid = UUID(str(patient_id))
        except ValueError:
            return None
        profile = (await db.execute(select(PatientProfile).where(PatientProfile.id == pid))).scalar_one_or_none()
        if not profile:
            return None
        # RBAC: patient can update self; doctor assigned; admin any
        if current_user.role == "patient" and str(profile.user_id) != str(current_user.id):
            from app.core.errors import forbidden
            raise forbidden()
        if current_user.role in ("doctor", "psychologist"):
            prac = (await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == current_user.id))).scalar_one_or_none()
            if not prac:
                from app.core.errors import forbidden
                raise forbidden()
            assignment = (await db.execute(select(PatientAssignment).where(
                PatientAssignment.patient_id == profile.id,
                PatientAssignment.practitioner_id == prac.id,
            ))).scalar_one_or_none()
            if not assignment:
                from app.core.errors import forbidden
                raise forbidden()
        for key, value in data.items():
            if value is None:
                continue
            if key == "birth_date" and isinstance(value, str):
                from datetime import date
                value = date.fromisoformat(value)
            if hasattr(profile, key):
                setattr(profile, key, value)
        await db.commit()
        await db.refresh(profile)
        user = (await db.execute(select(User).where(User.id == profile.user_id))).scalar_one_or_none()
        return {
            "id": str(profile.id),
            "email": user.email if user else None,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "middle_name": profile.middle_name,
            "birth_date": profile.birth_date.isoformat() if profile.birth_date else None,
            "gender": profile.gender,
            "role": user.role if user else "patient",
            "clinic_id": str(profile.clinic_id) if profile.clinic_id else None,
            "created_at": profile.created_at.isoformat() if getattr(profile, "created_at", None) else None,
        }

    async def get_patient_summary(self, db, patient_id: str, current_user) -> dict | None:
        data = await self.get_patient_by_id(db, patient_id, current_user)
        if not data:
            return None
        return {
            "id": data["id"],
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "clinic_id": data["clinic_id"],
        }
        return []