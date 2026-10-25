from uuid import UUID
import pytest
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app

DOCTOR_USER_ID = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"
DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.db
async def test_reports_flow(client: AsyncClient):
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    resp = await client.get(f"/api/v1/reports/pre-visit/{PATIENT_PROFILE_ID}", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["patient"]["id"] == PATIENT_PROFILE_ID

    resp = await client.get("/api/v1/reports/clinic-analytics", headers=headers)
    assert resp.status_code == 200, resp.text
    assert "patients_total" in resp.json()["data"]


async def test_reports_unauthorized(client: AsyncClient):
    resp = await client.get(f"/api/v1/reports/pre-visit/{PATIENT_PROFILE_ID}")
    assert resp.status_code == 401
