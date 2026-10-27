import pytest
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app
from uuid import UUID

USER_ID = UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
TOKEN = jwt_service.create_access_token(user_id=USER_ID, role="patient")


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.db
async def test_update_user_me(client: AsyncClient) -> None:
    headers = {"Authorization": f"Bearer {TOKEN}"}
    resp = await client.patch(
        f"/api/v1/users/{USER_ID}",
        headers=headers,
        json={"first_name": "Тест", "last_name": "Пользователь"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["first_name"] == "Тест"