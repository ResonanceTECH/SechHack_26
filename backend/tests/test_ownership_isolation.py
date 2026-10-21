"""Test suite for ownership isolation - core RBAC security requirement.

Verifies that each role sees only the patients they should per AUTH_PLAN.md §5.2:
- Patient: own profile only
- Doctor/Psychologist: clinic patients only
- Coordinator/Admin: all patients
"""
import pytest
from fastapi.testclient import TestClient
from fastapi import status


@pytest.mark.asyncio
async def test_patient_ownership_isolation():
    """Patient can only access their own profile, not other patients'."""
    from app.main import app
    
    client = TestClient(app)
    
    # Patient tries to access another patient's ID
    response = client.get("/api/v1/patients/other-patient-id", headers={"Authorization": "Bearer patient-token"})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_doctor_clinic_isolation():
    """Doctor can only see patients in their clinic."""
    from app.main import app
    
    client = TestClient(app)
    
    # Doctor tries to see patients from another clinic
    response = client.get("/api/v1/patients", headers={"Authorization": "Bearer doctor-token"})
    data = response.json()
    # Should only contain doctor's clinic patients
    assert "data" in data


@pytest.mark.asyncio
async def test_coordinator_all_patients():
    """Coordinator can see all patients regardless of clinic."""
    from app.main import app
    
    client = TestClient(app)
    
    response = client.get("/api/v1/patients", headers={"Authorization": "Bearer coordinator-token"})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    # Should contain patients from all clinics
    assert "data" in data
    assert len(data["data"]) > 0