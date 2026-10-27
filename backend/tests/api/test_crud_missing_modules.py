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
async def test_care_plan_crud_smoke(client: AsyncClient):
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    # create
    resp = await client.post("/api/v1/care-plans", json={
        "patient_id": PATIENT_PROFILE_ID,
        "title": "Smoke care plan",
        "description": "desc",
        "status": "active",
    }, headers=headers)
    assert resp.status_code in (200, 201), resp.text
    data = resp.json()["data"]
    cp_id = data.get("id") if isinstance(data, dict) else None
    # list
    resp = await client.get("/api/v1/care-plans", headers=headers)
    assert resp.status_code == 200, resp.text
    if cp_id:
        # update
        resp = await client.put(f"/api/v1/care-plans/{cp_id}", json={"title": "Updated"}, headers=headers)
        assert resp.status_code in (200, 204, 404), resp.text


@pytest.mark.db
async def test_exercise_assignment_crud_smoke(client: AsyncClient):
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    # need a care plan id first
    resp = await client.post("/api/v1/care-plans", json={
        "patient_id": PATIENT_PROFILE_ID,
        "title": "Ex plan",
        "status": "active",
    }, headers=headers)
    assert resp.status_code in (200, 201), resp.text
    cp_id = resp.json()["data"].get("id")
    # create assignment
    resp = await client.post("/api/v1/exercises", json={
        "care_plan_id": cp_id,
        "patient_id": PATIENT_PROFILE_ID,
        "exercise_type": "breathing",
        "payload": {"duration": 5},
    }, headers=headers)
    assert resp.status_code in (200, 201), resp.text
    assign_id = resp.json()["data"].get("id")
    # list
    resp = await client.get("/api/v1/exercises", headers=headers)
    assert resp.status_code == 200, resp.text
    if assign_id:
        resp = await client.put(f"/api/v1/exercises/{assign_id}", json={"exercise_type": "meditation"}, headers=headers)
        assert resp.status_code in (200, 204, 404), resp.text