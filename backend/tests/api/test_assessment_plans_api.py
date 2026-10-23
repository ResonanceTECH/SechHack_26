from uuid import UUID
import pytest
from fastapi.testclient import TestClient
from app.core.security import jwt as jwt_service

PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"
DOCTOR_USER_ID = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")

DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")
PSYCH_USER_ID = UUID("c3860428-8b82-494d-a617-cb2a546b649a")
PSYCH_TOKEN = jwt_service.create_access_token(user_id=PSYCH_USER_ID, role="psychologist")


@pytest.mark.db
def test_create_assessment_plan():
    from app.main import app
    client = TestClient(app)
    resp = client.post("/api/v1/assessment-plans", json={
        "patient_id": PATIENT_PROFILE_ID,
        "questionnaire_code": "phq9",
        "interval_days": 14,
        "enabled": True,
    }, headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"})
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["questionnaire_code"] == "phq9"
    assert data["interval_days"] == 14
    assert data["next_due_date"] is not None


@pytest.mark.db
def test_list_assessment_plans_patient():
    from app.main import app
    client = TestClient(app)
    resp = client.get("/api/v1/assessment-plans", params={"patient_id": PATIENT_PROFILE_ID},
                      headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp.status_code == 200
    assert "items" in resp.json()["data"]


def test_psychologist_cannot_write():
    from app.main import app
    client = TestClient(app)
    resp = client.post("/api/v1/assessment-plans", json={
        "patient_id": PATIENT_PROFILE_ID,
        "questionnaire_code": "gad7",
        "interval_days": 14,
    }, headers={"Authorization": f"Bearer {PSYCH_TOKEN}"})
    assert resp.status_code == 403


@pytest.mark.db
def test_create_invalid_questionnaire_422():
    from app.main import app
    client = TestClient(app)
    resp = client.post("/api/v1/assessment-plans", json={
        "patient_id": PATIENT_PROFILE_ID,
        "questionnaire_code": "unknown_q",
        "interval_days": 14,
    }, headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"})
    assert resp.status_code == 422


@pytest.mark.db
def test_get_unknown_plan_404():
    from app.main import app
    from uuid import uuid4
    client = TestClient(app)
    resp = client.get(f"/api/v1/assessment-plans/{uuid4()}",
                      headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"})
    assert resp.status_code == 404


def test_patient_cannot_create():
    from app.main import app
    client = TestClient(app)
    resp = client.post("/api/v1/assessment-plans", json={
        "patient_id": PATIENT_PROFILE_ID,
        "questionnaire_code": "gad7",
        "interval_days": 14,
    }, headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp.status_code == 403
