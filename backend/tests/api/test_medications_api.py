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
async def test_medication_crud_doctor(client: AsyncClient):
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    name = f"TestMed-{uuid4()}"
    resp = await client.post("/api/v1/medications", json={"name": name}, headers=headers)
    assert resp.status_code == 201
    med = resp.json()["data"]
    med_id = med["id"]
    assert med["name"] == name

    resp = await client.get("/api/v1/medications", headers=headers)
    assert resp.status_code == 200
    assert any(m["id"] == med_id for m in resp.json()["data"]["items"])

    resp = await client.get(f"/api/v1/medications/{med_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["id"] == med_id

    resp = await client.put(f"/api/v1/medications/{med_id}", json={"strength": "10mg"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["strength"] == "10mg"

    resp = await client.delete(f"/api/v1/medications/{med_id}", headers=headers)
    assert resp.status_code == 204


async def test_patient_cannot_create_medication(client: AsyncClient):
    resp = await client.post("/api/v1/medications", json={"name": "Nope"}, headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp.status_code == 403


@pytest.mark.db
async def test_prescription_and_adherence_flow(client: AsyncClient):
    doctor_headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    patient_headers = {"Authorization": f"Bearer {PATIENT_TOKEN}"}

    name = f"MedForPrescription-{uuid4()}"
    resp = await client.post("/api/v1/medications", json={"name": name}, headers=doctor_headers)
    assert resp.status_code == 201
    med_id = resp.json()["data"]["id"]

    resp = await client.post("/api/v1/prescriptions", json={
        "patient_id": PATIENT_PROFILE_ID,
        "medication_id": med_id,
        "dosage": "1 tab",
        "frequency": "daily",
        "start_date": "2026-01-01",
        "end_date": "2026-02-01",
    }, headers=doctor_headers)
    assert resp.status_code == 201
    presc = resp.json()["data"]
    presc_id = presc["id"]
    assert presc["medication_name"] == name

    resp = await client.get("/api/v1/prescriptions", params={"patient_id": PATIENT_PROFILE_ID}, headers=patient_headers)
    assert resp.status_code == 200
    assert any(p["id"] == presc_id for p in resp.json()["data"]["items"])

    resp = await client.post("/api/v1/adherence", json={
        "prescription_id": presc_id,
        "taken_at": "2026-01-02T08:00:00Z",
        "is_taken": True,
    }, headers=patient_headers)
    assert resp.status_code == 201

    resp = await client.get("/api/v1/adherence", params={"prescription_id": presc_id}, headers=patient_headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["total"] == 1

    resp = await client.get(f"/api/v1/prescriptions/{presc_id}/adherence-rate", headers=patient_headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["adherence"] == 1.0
