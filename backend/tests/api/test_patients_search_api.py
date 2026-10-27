import pytest
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app
from uuid import UUID

DOCTOR_USER_ID = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.db
async def test_patients_search(client: AsyncClient) -> None:
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    resp = await client.get("/api/v1/patients", headers=headers, params={"search": "Пользователь"})
    assert resp.status_code == 200, resp.text
    assert "data" in resp.json()