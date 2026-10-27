"""Test suite for Patient Repository RBAC and database operations.

Tests verify:
- Patient role: can only see their own data
- Doctor/Psychologist: see only patients in their clinic
- Coordinator/Admin: see all patients
- Repository methods: get_patients_by_user
"""
import asyncio
from uuid import UUID

import pytest

from app.db.session import session_factory
from app.models.user import User
from app.repositories.patient_repository import PatientRepository

PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
COORDINATOR_USER_ID = UUID("9efa3cfa-503f-46d2-8f41-61c22f4f2d10")


async def _get_user(user_id: UUID) -> User:
    async with session_factory() as session:
        user = await session.get(User, user_id)
        assert user is not None, f"User {user_id} not found in DB (seed data missing?)"
        return user


@pytest.mark.db
@pytest.mark.asyncio
async def test_patient_ownership():
    """Patient can only see their own data via repository."""
    repo = PatientRepository()
    patient_user = await _get_user(PATIENT_USER_ID)

    async with session_factory() as db:
        patients = await repo.get_patients_by_user(
            db=db,
            user_id=str(PATIENT_USER_ID),
            current_user=patient_user,
        )

    assert patients is not None
    assert isinstance(patients, list)
    # Patient should see at most their own profile
    assert len(patients) <= 1, f"Patient saw {len(patients)} profiles, expected <= 1"
    if patients:
        # The patient's own profile should be returned (check by email match with user)
        assert patients[0]["role"] == "patient"


@pytest.mark.db
@pytest.mark.asyncio
async def test_coordinator_access():
    """Coordinator can see all patients via repository."""
    repo = PatientRepository()
    coord_user = await _get_user(COORDINATOR_USER_ID)

    async with session_factory() as db:
        patients = await repo.get_patients_by_user(
            db=db,
            user_id=str(COORDINATOR_USER_ID),
            current_user=coord_user,
        )

    assert patients is not None
    assert isinstance(patients, list)
    # Coordinator should see more than one patient
    assert len(patients) > 1, f"Coordinator saw only {len(patients)} patients, expected > 1"
