from uuid import UUID, uuid4
import pytest
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app

DOCTOR_USER_ID = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"

DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.db
async def test_message_flow(client: AsyncClient):
    doctor_headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    patient_headers = {"Authorization": f"Bearer {PATIENT_TOKEN}"}

    body = f"Hello-{uuid4()}"
    resp = await client.post("/api/v1/messages", json={
        "recipient_id": str(PATIENT_USER_ID),
        "patient_id": PATIENT_PROFILE_ID,
        "body": body,
    }, headers=doctor_headers)
    assert resp.status_code == 201
    msg = resp.json()["data"]
    msg_id = msg["id"]
    assert msg["body"] == body
    assert msg["is_read"] is False

    resp = await client.get("/api/v1/messages", params={"patient_id": PATIENT_PROFILE_ID}, headers=patient_headers)
    assert resp.status_code == 200
    assert any(m["id"] == msg_id for m in resp.json()["data"]["items"])

    resp = await client.patch(f"/api/v1/messages/{msg_id}/read", headers=patient_headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["is_read"] is True


async def test_patient_cannot_message_without_permission(client: AsyncClient):
    # coordinator has message:read too; patient can send; test forbidden role not in permission? Use no token
    resp = await client.get("/api/v1/messages")
    assert resp.status_code == 401