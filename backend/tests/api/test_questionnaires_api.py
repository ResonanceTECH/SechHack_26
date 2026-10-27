from fastapi.testclient import TestClient
from app.core.security import jwt as jwt_service
from uuid import UUID

PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")


def test_list_questionnaires():
    from app.main import app
    client = TestClient(app)
    resp = client.get("/api/v1/questionnaires", headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp.status_code == 200
    assert len(resp.json()["data"]["questionnaires"]) >= 2


def test_get_questionnaire():
    from app.main import app
    client = TestClient(app)
    resp = client.get("/api/v1/questionnaires/phq9", headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp.status_code == 200
    assert len(resp.json()["data"]["questions"]) == 9


def test_get_version():
    from app.main import app
    client = TestClient(app)
    resp = client.get("/api/v1/questionnaires/phq9/versions/1.0", headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp.status_code == 200


def test_unknown_questionnaire():
    from app.main import app
    client = TestClient(app)
    resp = client.get("/api/v1/questionnaires/unknown", headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert resp.status_code == 404
