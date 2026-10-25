import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


class TestDiaryApiSmoke:
    async def test_diary_requires_auth(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/diary")
        assert response.status_code in (401, 403)

    async def test_openapi_contains_diary_paths(self, client: AsyncClient) -> None:
        response = await client.get("/openapi.json")
        assert response.status_code == 200
        paths = response.json()["paths"]
        assert "/api/v1/diary" in paths
        assert "/api/v1/diary/summary" in paths
