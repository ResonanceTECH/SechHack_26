from uuid import UUID
import pytest
from fastapi.testclient import TestClient
from app.core.security import jwt as jwt_service

PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"
DOCTOR_USER_ID = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PSYCH_USER_ID = UUID("00000000-0000-0000-0000-000000000000")

DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")


@pytest.mark.db
def test_create_diagnosis():
    from app.main import app
    client = TestClient(app)
    resp = client.post("/api/v1/diagnoses", json={
        "patient_id": PATIENT_PROFILE_ID,
        "coding_system": "ICD10",
        "code": "F41.1",
        "title": "GAD",
        "is_primary": False,
    }, headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"})
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["coding_system"] == "ICD10"
    assert data["code"] == "F41.1"


@pytest.mark.db
def test_create_diagnosis_icd11():
    from app.main import app
    client = TestClient(app)
    resp = client.post("/api/v1/diagnoses", json={
        "patient_id": PATIENT_PROFILE_ID,
        "coding_system": "ICD11",
        "code": "6B00",
        "title": "GAD ICD11",
    }, headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"})
    assert resp.status_code == 201
    assert resp.json()["data"]["coding_system"] == "ICD11"


@pytest.mark.db
def test_patient_diagnoses_list():
    from app.main import app
    client = TestClient(app)
    resp = client.get(f"/api/v1/patients/{PATIENT_PROFILE_ID}/diagnoses", headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp.status_code == 200
    assert "items" in resp.json()["data"]


def test_patient_cannot_create_diagnosis():
    from app.main import app
    client = TestClient(app)
    resp = client.post("/api/v1/diagnoses", json={
        "patient_id": PATIENT_PROFILE_ID,
        "coding_system": "ICD10",
        "code": "F41.1",
    }, headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp.status_code == 403
