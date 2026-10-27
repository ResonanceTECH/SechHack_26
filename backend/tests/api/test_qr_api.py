import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


async def test_qr_invite(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/qr/invite", params={"code": "RAV27400"})
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["code"] == "RAV27400"