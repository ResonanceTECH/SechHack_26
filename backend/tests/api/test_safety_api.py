from uuid import UUID
import pytest
from fastapi.testclient import TestClient
from app.core.security import jwt as jwt_service

PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"
DOCTOR_USER_ID = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")

DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")


@pytest.mark.db
def test_create_safety_plan():
    from app.main import app
    client = TestClient(app)
    resp = client.post("/api/v1/safety/plans", json={
        "patient_id": PATIENT_PROFILE_ID,
        "title": "Safety Plan",
    }, headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"})
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["title"] == "Safety Plan"


@pytest.mark.db
def test_create_crisis_signal():
    from app.main import app
    client = TestClient(app)
    resp = client.post("/api/v1/safety/crisis-signals", json={
        "patient_id": PATIENT_PROFILE_ID,
        "type": "red_flag",
        "source": "practitioner_manual",
        "message": "test",
    }, headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"})
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["type"] == "red_flag"
