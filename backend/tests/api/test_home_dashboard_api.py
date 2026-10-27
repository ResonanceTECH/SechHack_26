from uuid import UUID
import pytest
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app

PATIENT_USER_ID = UUID('70f7a34f-f8df-49fc-a724-28f6d656c938')
DOCTOR_USER_ID = UUID('ba827169-c584-4186-a357-2e6a8bd8d04e')
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role='patient')
DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role='doctor')


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as c:
        yield c


@pytest.mark.db
async def test_home_dashboard_patient(client: AsyncClient) -> None:
    resp = await client.get('/api/v1/home/dashboard', headers={'Authorization': f'Bearer {PATIENT_TOKEN}'})
    assert resp.status_code == 200, resp.text
    data = resp.json()['data']
    assert data['role'] == 'patient'
    assert 'patient_home' in data
    assert 'patient' in data
    assert 'alerts' in data
    assert 'latest_diary' in data
    assert 'next_appointment' in data


@pytest.mark.db
async def test_home_dashboard_doctor(client: AsyncClient) -> None:
    resp = await client.get('/api/v1/home/dashboard', headers={'Authorization': f'Bearer {DOCTOR_TOKEN}'})
    assert resp.status_code == 200, resp.text
    data = resp.json()['data']
    assert data['role'] == 'doctor'
    assert 'practitioner' in data
    assert 'stats' in data
    assert 'alerts' in data
    assert 'appointments_today' in data
    assert 'recent_patients' in data


async def test_home_dashboard_requires_auth(client: AsyncClient) -> None:
    resp = await client.get('/api/v1/home/dashboard')
    assert resp.status_code in (401, 403)
