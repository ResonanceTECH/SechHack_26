from uuid import UUID
import pytest
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app

PATIENT_USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.db
async def test_user_get_and_patch(client: AsyncClient) -> None:
    headers = {"Authorization": f"Bearer {PATIENT_TOKEN}"}
    resp = await client.get(f"/api/v1/users/{PATIENT_USER_ID}", headers=headers)
    assert resp.status_code == 200, resp.text

    resp = await client.patch(
        f"/api/v1/users/{PATIENT_USER_ID}",
        json={"first_name": "Тест", "last_name": "Пользователь"},
        headers=headers,
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["first_name"] == "Тест"


async def test_user_requires_auth(client: AsyncClient) -> None:
    resp = await client.get(f"/api/v1/users/{PATIENT_USER_ID}")
    assert resp.status_code in (401, 403)
