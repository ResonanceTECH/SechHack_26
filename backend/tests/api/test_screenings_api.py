from uuid import UUID
import pytest
from fastapi.testclient import TestClient
from app.core.security import jwt as jwt_service

PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")


@pytest.mark.db
def test_create_screening():
    from app.main import app
    client = TestClient(app)
    answers = [{"question_id": f"q{i+1}", "value": 1 if i != 8 else 0} for i in range(9)]
    resp = client.post("/api/v1/screenings", json={"questionnaire_type": "phq9", "questionnaire_version": "1.0", "answers": answers, "score": 999}, headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["score"] == 8  # client score ignored
    assert data["is_critical"] is False


@pytest.mark.db
def test_get_screening():
    from app.main import app
    client = TestClient(app)
    sid = "9a82e804-343d-4e4a-a8fb-abc32c02e8c6"
    resp2 = client.get(f"/api/v1/screenings/{sid}", headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp2.status_code == 200


def test_patient_screenings_history():
    from app.main import app
    client = TestClient(app)
    resp = client.get(f"/api/v1/patients/{PATIENT_PROFILE_ID}/screenings", headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
@pytest.mark.db
def test_patient_screening_trend():
    from app.main import app
    client = TestClient(app)
    resp = client.get(f"/api/v1/patients/{PATIENT_PROFILE_ID}/screening-trend?questionnaire_code=phq9",
                      headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["questionnaire_code"] == "phq9"
    assert "trend" in data
    assert resp.status_code == 200
