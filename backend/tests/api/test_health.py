"""API-тесты health-check через httpx + ASGI (без БД и с БД)."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


class TestHealthNoDb:
    async def test_health_returns_ok_for_mobile_client(self, client: AsyncClient) -> None:
        """/health — тот же контракт, что ждёт mobile/src/api/client.ts: {ok: true}."""
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"ok": True}

    async def test_request_id_header_set(self, client: AsyncClient) -> None:
        response = await client.get("/health")
        assert response.headers.get("X-Request-ID")
        assert response.headers.get("X-Content-Type-Options") == "nosniff"

    async def test_v1_health_uses_envelope(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        body = response.json()
        assert body["data"] == {"status": "healthy"}
        assert body["error"] is None
        assert "request_id" in body["meta"]


class TestDbHealth:
    @pytest.mark.db
    async def test_db_health_ok(self, client: AsyncClient) -> None:
        """/db/health — SELECT NOW() (мобильный клиент ждёт {ok, now, db})."""
        response = await client.get("/db/health")
        assert response.status_code == 200
        body = response.json()
        assert body["ok"] is True
        assert body["db"] == "sechhack"

    async def test_unknown_route_uses_envelope_404(self, client: AsyncClient) -> None:
        response = await client.get("/api/v1/no-such-endpoint")
        assert response.status_code == 404
        body = response.json()
        assert body["error"]["code"] == "not_found"
