from uuid import UUID
import pytest
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app

PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")
DOCTOR_USER_ID = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.db
async def test_patient_symptoms_returns_series(client: AsyncClient) -> None:
    headers = {"Authorization": f"Bearer {PATIENT_TOKEN}"}
    resp = await client.get(f"/api/v1/patients/{PATIENT_PROFILE_ID}/symptoms", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["patient_id"] == PATIENT_PROFILE_ID
    assert "items" in data
    assert "total" in data


async def test_patient_symptoms_requires_auth(client: AsyncClient) -> None:
    resp = await client.get(f"/api/v1/patients/{PATIENT_PROFILE_ID}/symptoms")
    assert resp.status_code in (401, 403)


@pytest.mark.db
async def test_patient_symptoms_cross_clinic_forbidden(client: AsyncClient) -> None:
    from uuid import uuid4
    from app.db.session import session_factory
    from app.models.clinic import Clinic
    from app.models.profile import PatientProfile
    from app.models.user import User

    async with session_factory() as session:
        clinic = Clinic(name=f"Other clinic {uuid4()}")
        session.add(clinic)
        await session.commit()
        await session.refresh(clinic)
        user = User(email=f"cross-{uuid4()}@example.com", role="patient")
        session.add(user)
        await session.commit()
        await session.refresh(user)
        profile = PatientProfile(user_id=user.id, first_name="Cross", last_name="Clinic", consent_personal_data=True, consent_medical_data=True, clinic_id=clinic.id)
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
        profile_id = profile.id
        clinic_id = clinic.id
        user_id = user.id

    try:
        resp = await client.get(f"/api/v1/patients/{profile_id}/symptoms", headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"})
        assert resp.status_code == 403, resp.text
    finally:
        async with session_factory() as session:
            p = await session.get(PatientProfile, profile_id)
            if p: await session.delete(p)
            u = await session.get(User, user_id)
            if u: await session.delete(u)
            c = await session.get(Clinic, clinic_id)
            if c: await session.delete(c)
            await session.commit()