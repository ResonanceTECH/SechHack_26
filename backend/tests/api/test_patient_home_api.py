from uuid import UUID
import pytest
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app

PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.db
async def test_patient_home_returns_aggregate(client: AsyncClient) -> None:
    headers = {"Authorization": f"Bearer {PATIENT_TOKEN}"}
    resp = await client.get(f"/api/v1/patients/{PATIENT_PROFILE_ID}/home", headers=headers)
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "data" in body
    data = body["data"]
    assert "patient" in data
    assert "alerts" in data
    assert "latest_diary" in data
    assert "next_appointment" in data


async def test_patient_home_requires_auth(client: AsyncClient) -> None:
    resp = await client.get(f"/api/v1/patients/{PATIENT_PROFILE_ID}/home")
    assert resp.status_code in (401, 403)