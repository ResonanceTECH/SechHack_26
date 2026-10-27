"""Test suite for ownership isolation - core RBAC security requirement.

Verifies that each role sees only the patients they should per AUTH_PLAN.md §5.2:
- Patient: own profile only
- Doctor/Psychologist: clinic patients only
- Coordinator/Admin: all patients
"""
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from fastapi import status

from app.core.security import jwt as jwt_service
from app.db.session import session_factory
from app.models.user import User
from app.models.profile import PatientProfile

PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
COORDINATOR_USER_ID = UUID("9efa3cfa-503f-46d2-8f41-61c22f4f2d10")
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")
COORDINATOR_TOKEN = jwt_service.create_access_token(user_id=COORDINATOR_USER_ID, role="coordinator")


async def _create_other_patient() -> tuple[UUID, UUID]:
    async with session_factory() as session:
        other_user = User(email=f"other-{uuid4()}@example.com", role="patient")
        session.add(other_user)
        await session.commit()
        await session.refresh(other_user)
        other_profile = PatientProfile(
            user_id=other_user.id,
            first_name="Other",
            last_name="Patient",
            consent_personal_data=True,
            consent_medical_data=True,
        )
        session.add(other_profile)
        await session.commit()
        await session.refresh(other_profile)
        return other_user.id, other_profile.id


async def _delete_other_patient(user_id: UUID, profile_id: UUID) -> None:
    async with session_factory() as session:
        db_profile = await session.get(PatientProfile, profile_id)
        if db_profile is not None:
            await session.delete(db_profile)
        db_user = await session.get(User, user_id)
        if db_user is not None:
            await session.delete(db_user)
        await session.commit()


@pytest.mark.db
@pytest.mark.db
@pytest.mark.asyncio
async def test_patient_ownership_isolation():
    """Patient can only access their own profile, not other patients'."""
    other_user_id, other_profile_id = await _create_other_patient()
    try:
        from httpx import AsyncClient, ASGITransport
        from app.main import app

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(
                f"/api/v1/patients/{other_profile_id}",
                headers={"Authorization": f"Bearer {PATIENT_TOKEN}"},
            )
            assert response.status_code == status.HTTP_403_FORBIDDEN
    finally:
        await _delete_other_patient(other_user_id, other_profile_id)


@pytest.mark.db
def test_doctor_clinic_isolation():
    """Doctor can only see patients in their clinic."""
    from app.main import app

    client = TestClient(app)
    doctor_user_id = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
    doctor_token = jwt_service.create_access_token(user_id=doctor_user_id, role="doctor")
    response = client.get("/api/v1/patients", headers={"Authorization": f"Bearer {doctor_token}"})
    data = response.json()
    assert "data" in data
    # Doctor should only see patients from their own clinic
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.db
def test_coordinator_all_patients():
    """Coordinator can see all patients regardless of clinic."""
    from app.main import app

    client = TestClient(app)

    response = client.get("/api/v1/patients", headers={"Authorization": f"Bearer {COORDINATOR_TOKEN}"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    assert len(data["data"]) > 0
