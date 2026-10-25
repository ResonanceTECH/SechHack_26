from uuid import UUID
import pytest
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app

PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.db
async def test_consent_store(client: AsyncClient) -> None:
    headers = {"Authorization": f"Bearer {PATIENT_TOKEN}"}
    payload = {
        "consent_personal_data": True,
        "consent_medical_data": True,
        "consent_data_sharing_with_doctor": True,
    }
    resp = await client.post("/api/v1/auth/consent", json=payload, headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["consent_personal_data"] is True
    assert data["consent_medical_data"] is True


async def test_consent_requires_auth(client: AsyncClient) -> None:
    resp = await client.post("/api/v1/auth/consent", json={"consent_personal_data": True, "consent_medical_data": True})
    assert resp.status_code in (401, 403)
