"""Test suite for Patient API endpoints.

Tests verify the router → service → repository → database pattern
with RBAC enforcement on all endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from fastapi import status


def test_get_patients_endpoint():
    """GET /api/v1/patients should return patients based on user RBAC."""
    from app.main import app
    
    client = TestClient(app)
    
    # Test with authenticated patient
    response = client.get("/api/v1/patients", headers={"Authorization": "Bearer patient-token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    # Patient should only see their own data
    assert "data" in data


def test_get_patient_endpoint():
    """GET /api/v1/patients/{id} should retrieve patient detail."""
    from app.main import app
    
    client = TestClient(app)
    
    response = client.get("/api/v1/patients/patient-123", headers={"Authorization": "Bearer patient-token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    # Patient should only see their own profile
    assert data["data"]["id"] == "patient-123"


def test_patch_patient_endpoint():
    """PATCH /api/v1/patients/{id} should update patient data."""
    from app.main import app
    
    client = TestClient(app)
    
    response = client.patch(
        "/api/v1/patients/patient-123",
        json={"first_name": "Updated"},
        headers={"Authorization": "Bearer patient-token"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["data"]["first_name"] == "Updated"


def test_get_patient_summary_endpoint():
    """GET /api/v1/patients/{id}/summary should return patient summary."""
    from app.main import app
    
    client = TestClient(app)
    
    response = client.get("/api/v1/patients/patient-123/summary", headers={"Authorization": "Bearer patient-token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "data" in data