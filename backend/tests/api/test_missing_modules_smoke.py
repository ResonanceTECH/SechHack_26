from uuid import UUID, uuid4
import pytest
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app

DOCTOR_USER_ID = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"
CLINIC_ADMIN_USER_ID = UUID("11111111-2222-3333-4444-555555555555")

DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")
CLINIC_ADMIN_TOKEN = jwt_service.create_access_token(user_id=CLINIC_ADMIN_USER_ID, role="clinic_admin")


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.db
async def test_alerts_list_smoke(client: AsyncClient):
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    resp = await client.get("/api/v1/alerts", headers=headers)
    assert resp.status_code == 200, resp.text


@pytest.mark.db
async def test_exercises_and_care_plans_list_smoke(client: AsyncClient):
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    resp = await client.get("/api/v1/care-plans", headers=headers)
    assert resp.status_code == 200, resp.text
    resp = await client.get("/api/v1/exercises", headers=headers)
    assert resp.status_code == 200, resp.text


@pytest.mark.db
async def test_integrations_event_flow_smoke(client: AsyncClient):
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    key = f"smoke-{uuid4()}"
    resp = await client.post("/api/v1/integrations/events", json={
        "source_system": "smoke",
        "target_system": "clinicalcompass",
        "event_type": "smoke",
        "entity_type": "test",
        "idempotency_key": key,
        "payload": {},
    }, headers=headers)
    assert resp.status_code == 201, resp.text
    event_id = resp.json()["data"]["id"]
    resp = await client.get(f"/api/v1/integrations/events/{event_id}", headers=headers)
    assert resp.status_code == 200, resp.text


@pytest.mark.db
async def test_assignments_list_smoke(client: AsyncClient):
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    resp = await client.get("/api/v1/assignments", headers=headers)
    assert resp.status_code == 200, resp.text


@pytest.mark.db
async def test_practitioners_invite_codes_smoke(client: AsyncClient):
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    # practitioner profile may not exist for dummy id; endpoint should still be reachable
    dummy = "00000000-0000-0000-0000-000000000000"
    resp = await client.get(f"/api/v1/practitioners/{dummy}/invite-codes", headers=headers)
    assert resp.status_code in (200, 404), resp.text


@pytest.mark.db
async def test_schedule_and_clinic_settings_smoke(client: AsyncClient):
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    clinic_id = "00000000-0000-0000-0000-000000000000"
    resp = await client.get(f"/api/v1/clinics/{clinic_id}/settings", headers=headers)
    assert resp.status_code in (403,), resp.text
    dummy_prac = "00000000-0000-0000-0000-000000000000"
    resp = await client.get(f"/api/v1/practitioners/{dummy_prac}/schedule", headers=headers)
    assert resp.status_code in (200, 403, 404, 422), resp.text


@pytest.mark.db
async def test_admin_and_audit_smoke(client: AsyncClient):
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    resp = await client.get("/api/v1/admin/staff", headers=headers)
    assert resp.status_code == 403, resp.text
    resp = await client.get("/api/v1/audit/logs", headers=headers)
    assert resp.status_code == 403, resp.text