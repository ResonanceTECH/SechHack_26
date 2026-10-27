from uuid import UUID, uuid4
import pytest
from datetime import datetime, timezone
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app

DOCTOR_USER_ID = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"
DOCTOR_PROFILE_ID = "3be78471-d763-46da-9df9-f8640f5dacc4"

DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.db
async def test_appointment_flow(client: AsyncClient):
    doctor_headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    patient_headers = {"Authorization": f"Bearer {PATIENT_TOKEN}"}

    scheduled = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    resp = await client.post("/api/v1/appointments", json={
        "patient_id": PATIENT_PROFILE_ID,
        "practitioner_id": DOCTOR_PROFILE_ID,
        "scheduled_at": scheduled,
        "reason": "Checkup",
    }, headers=doctor_headers)
    assert resp.status_code == 201, resp.text
    appt = resp.json()["data"]
    appt_id = appt["id"]
    assert appt["status"] == "scheduled"

    resp = await client.get("/api/v1/appointments", params={"patient_id": PATIENT_PROFILE_ID}, headers=patient_headers)
    assert resp.status_code == 200
    assert any(a["id"] == appt_id for a in resp.json()["data"]["items"])


async def test_appointment_unauthorized(client: AsyncClient):
    resp = await client.get("/api/v1/appointments")
    assert resp.status_code == 401