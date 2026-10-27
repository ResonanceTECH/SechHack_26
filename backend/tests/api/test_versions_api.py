import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


class TestVersionsApiSmoke:
    async def test_versions_requires_auth(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/versions", params={"entity_type": "diary_entry", "entity_id": "00000000-0000-0000-0000-000000000000"})
        assert response.status_code in (401, 403)

    async def test_openapi_contains_versions_paths(self, client: AsyncClient) -> None:
        response = await client.get("/openapi.json")
        assert response.status_code == 200
        paths = response.json()["paths"]
        assert "/api/v1/versions" in paths