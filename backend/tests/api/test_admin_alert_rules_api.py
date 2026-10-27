from uuid import UUID, uuid4
import pytest
from httpx import ASGITransport, AsyncClient
from app.core.security import jwt as jwt_service
from app.main import app
from app.db.session import session_factory
from app.models.user import User

DOCTOR_USER_ID = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")


@pytest.fixture
async def client() -> AsyncClient:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


async def _create_clinic_admin() -> UUID:
    async with session_factory() as session:
        user = User(email=f"ca-{uuid4()}@example.com", role="clinic_admin", is_active=True)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user.id


async def _delete_user(user_id: UUID) -> None:
    async with session_factory() as session:
        u = await session.get(User, user_id)
        if u is not None:
            await session.delete(u)
        await session.commit()


@pytest.mark.db
async def test_admin_alert_rules_forbidden_for_doctor(client: AsyncClient) -> None:
    headers = {"Authorization": f"Bearer {DOCTOR_TOKEN}"}
    resp = await client.get("/api/v1/admin/alert-rules", headers=headers)
    assert resp.status_code == 403, resp.text


@pytest.mark.db
async def test_admin_alert_rules_list_and_reload(client: AsyncClient) -> None:
    user_id = await _create_clinic_admin()
    token = jwt_service.create_access_token(user_id=user_id, role="clinic_admin")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = await client.get("/api/v1/admin/alert-rules", headers=headers)
        assert resp.status_code == 200, resp.text
        data = resp.json()["data"]
        assert "items" in data
        assert "total" in data

        resp2 = await client.post("/api/v1/admin/alert-rules/reload", headers=headers)
        assert resp2.status_code == 200, resp2.text
        data2 = resp2.json()["data"]
        assert data2.get("reloaded") is True
    finally:
        await _delete_user(user_id)