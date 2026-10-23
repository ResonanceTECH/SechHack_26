"""Test suite for Patient API endpoints.

Tests verify the router → service → repository → database pattern
with RBAC enforcement on all endpoints.
"""
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from fastapi import status

from app.core.security import jwt as jwt_service

PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")


@pytest.mark.db
def test_get_patients_endpoint():
    """GET /api/v1/patients should return patients based on user RBAC."""
    from app.main import app

    client = TestClient(app)

    response = client.get("/api/v1/patients", headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data


@pytest.mark.db
def test_get_patient_endpoint():
    """GET /api/v1/patients/{id} should retrieve patient detail."""
    from app.main import app

    client = TestClient(app)

    response = client.get(f"/api/v1/patients/{PATIENT_PROFILE_ID}", headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["id"] == PATIENT_PROFILE_ID


@pytest.mark.db
def test_patch_patient_endpoint():
    """PATCH /api/v1/patients/{id} should update patient data."""
    from app.main import app

    client = TestClient(app)

    response = client.patch(
        f"/api/v1/patients/{PATIENT_PROFILE_ID}",
        json={"first_name": "Updated"},
        headers={"Authorization": f"Bearer {PATIENT_TOKEN}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["first_name"] == "Updated"


@pytest.mark.db
def test_get_patient_summary_endpoint():
    """GET /api/v1/patients/{id}/summary should return patient summary."""
    from app.main import app

    client = TestClient(app)

    response = client.get(f"/api/v1/patients/{PATIENT_PROFILE_ID}/summary", headers={"Authorization": f"Bearer {PATIENT_TOKEN}"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data
    assert "adherence" in data["data"]
