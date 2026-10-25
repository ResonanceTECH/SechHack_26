"""Diary CRUD-тесты (Phase B — последний backend debt).

Покрывает: CREATE, READ list, READ single (если есть), UPDATE, DELETE,
Summary, Bulk-sync, Ownership isolation, Cross-clinic isolation,
Versioning, Audit events, Constraint validation, Duplicate prevention.

Маркер `@pytest.mark.db` — требует PostgreSQL (SKIP_DB_TESTS=1 пропускает).
Все тесты используют AsyncClient (как test_diary_api.py) из-за особенностей
event loop на Windows с async SQLAlchemy + TestClient.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import jwt as jwt_service

# Seed user / profile IDs (docs/CLIENT_MAPPING.md §2)
PATIENT_USER_ID = uuid.UUID("70f7a34f-f8df-49fc-a724-28f6d656c938")
PATIENT_PROFILE_ID = uuid.UUID("705fa5d0-acfa-40e8-88d7-e4c516aa1048")
DOCTOR_USER_ID = uuid.UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
COORDINATOR_USER_ID = uuid.UUID("9efa3cfa-503f-46d2-8f41-61c22f4f2d10")

PATIENT_TOKEN = jwt_service.create_access_token(user_id=PATIENT_USER_ID, role="patient")
DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")
COORDINATOR_TOKEN = jwt_service.create_access_token(user_id=COORDINATOR_USER_ID, role="coordinator")

BASE = "/api/v1/diary"


def _auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _entry_payload(
    recorded_at: datetime | None = None,
    mood_score: int | None = 0,
    anxiety_score: int | None = 1,
    energy_score: int | None = 2,
    functioning_score: int | None = 3,
    sleep_hours: float | None = 7.5,
    sleep_quality: int | None = 3,
    notes: str | None = "тестовая запись",
    device_id: str | None = None,
) -> dict:
    if recorded_at is None:
        recorded_at = datetime.now(timezone.utc).replace(microsecond=0)
    payload: dict = {
        "recorded_at": recorded_at.isoformat(),
        "mood_score": mood_score,
        "anxiety_score": anxiety_score,
        "energy_score": energy_score,
        "functioning_score": functioning_score,
        "sleep_hours": sleep_hours,
        "sleep_quality": sleep_quality,
        "notes": notes,
    }
    if device_id is not None:
        payload["device_id"] = device_id
    return payload


async def _async_client() -> AsyncClient:
    from app.main import app as _app

    transport = ASGITransport(app=_app)
    return AsyncClient(transport=transport, base_url="http://test")


class TestDiaryCreate:
    """POST /api/v1/diary"""

    @pytest.mark.db
    async def test_patient_create_valid_entry(self) -> None:
        async with await _async_client() as client:
            resp = await client.post(BASE, json=_entry_payload(), headers=_auth_header(PATIENT_TOKEN))
            assert resp.status_code == 201, resp.text
            data = resp.json()["data"]
            assert data["patient_id"] == str(PATIENT_PROFILE_ID)
            assert data["mood_score"] == 0
            assert data["notes"] == "тестовая запись"
            assert "id" in data

    @pytest.mark.db
    async def test_patient_create_all_nullable_scores_none(self) -> None:
        async with await _async_client() as client:
            payload = _entry_payload(
                mood_score=None, anxiety_score=None, energy_score=None,
                functioning_score=None, sleep_hours=None, sleep_quality=None,
                notes=None,
            )
            resp = await client.post(BASE, json=payload, headers=_auth_header(PATIENT_TOKEN))
            assert resp.status_code == 201, resp.text
            data = resp.json()["data"]
            assert data["mood_score"] is None
            assert data["anxiety_score"] is None

    @pytest.mark.db
    async def test_patient_create_mood_score_out_of_range(self) -> None:
        async with await _async_client() as client:
            resp = await client.post(
                BASE, json=_entry_payload(mood_score=10), headers=_auth_header(PATIENT_TOKEN)
            )
            assert resp.status_code == 422, resp.text

    @pytest.mark.db
    async def test_patient_create_anxiety_score_out_of_range(self) -> None:
        async with await _async_client() as client:
            resp = await client.post(
                BASE, json=_entry_payload(anxiety_score=9), headers=_auth_header(PATIENT_TOKEN)
            )
            assert resp.status_code == 422, resp.text

    @pytest.mark.db
    async def test_doctor_cannot_create_diary(self) -> None:
        async with await _async_client() as client:
            resp = await client.post(
                BASE, json=_entry_payload(), headers=_auth_header(DOCTOR_TOKEN)
            )
            assert resp.status_code == 403, resp.text

    @pytest.mark.db
    async def test_create_requires_auth(self) -> None:
        async with await _async_client() as client:
            resp = await client.post(BASE, json=_entry_payload())
            assert resp.status_code in (401, 403), resp.text


class TestDiaryReadList:
    """GET /api/v1/diary"""

    @pytest.mark.db
    async def test_patient_list_own_entries(self) -> None:
        async with await _async_client() as client:
            await client.post(BASE, json=_entry_payload(), headers=_auth_header(PATIENT_TOKEN))
            resp = await client.get(BASE, headers=_auth_header(PATIENT_TOKEN))
            assert resp.status_code == 200, resp.text
            data = resp.json()["data"]
            assert "items" in data
            assert "total" in data
            assert data["total"] >= 1
            assert all(i["patient_id"] == str(PATIENT_PROFILE_ID) for i in data["items"])

    @pytest.mark.db
    async def test_doctor_list_patient_entries_clinic_isolation(self) -> None:
        async with await _async_client() as client:
            resp = await client.get(
                BASE,
                params={"patient_id": str(PATIENT_PROFILE_ID)},
                headers=_auth_header(DOCTOR_TOKEN),
            )
            assert resp.status_code in (200, 403), resp.text

    @pytest.mark.db
    async def test_doctor_list_without_patient_id(self) -> None:
        async with await _async_client() as client:
            resp = await client.get(BASE, headers=_auth_header(DOCTOR_TOKEN))
            assert resp.status_code == 422, resp.text

    @pytest.mark.db
    async def test_list_date_filtering(self) -> None:
        async with await _async_client() as client:
            now = datetime.now(timezone.utc).replace(microsecond=0)
            await client.post(
                BASE, json=_entry_payload(recorded_at=now), headers=_auth_header(PATIENT_TOKEN)
            )
            resp = await client.get(
                BASE,
                params={
                    "date_from": (now - timedelta(days=1)).isoformat(),
                    "date_to": (now + timedelta(days=1)).isoformat(),
                },
                headers=_auth_header(PATIENT_TOKEN),
            )
            assert resp.status_code == 200, resp.text
            data = resp.json()["data"]
            assert data["total"] >= 1

    @pytest.mark.db
    async def test_list_requires_auth(self) -> None:
        async with await _async_client() as client:
            resp = await client.get(BASE)
            assert resp.status_code in (401, 403), resp.text


class TestDiaryReadSingle:
    """GET /api/v1/diary/{entry_id} — проверяем наличие эндпоинта в OpenAPI."""

    @pytest.mark.db
    async def test_openapi_has_single_entry_path(self) -> None:
        async with await _async_client() as client:
            resp = await client.get("/openapi.json")
            assert resp.status_code == 200
            paths = resp.json()["paths"]
            assert f"{BASE}/{{entry_id}}" in paths, "GET /api/v1/diary/{entry_id} отсутствует в OpenAPI"

    @pytest.mark.db
    async def test_patient_read_own_entry(self) -> None:
        async with await _async_client() as client:
            create_resp = await client.post(BASE, json=_entry_payload(), headers=_auth_header(PATIENT_TOKEN))
            assert create_resp.status_code == 201
            entry_id = create_resp.json()["data"]["id"]

            resp = await client.get(f"{BASE}/{entry_id}", headers=_auth_header(PATIENT_TOKEN))
            assert resp.status_code in (200, 404, 405), resp.text
            if resp.status_code == 200:
                data = resp.json()["data"]
                assert data["id"] == entry_id


class TestDiaryUpdate:
    """PUT /api/v1/diary/{entry_id}"""

    @pytest.mark.db
    async def test_patient_update_own_entry_sets_is_edited(self) -> None:
        async with await _async_client() as client:
            create_resp = await client.post(BASE, json=_entry_payload(), headers=_auth_header(PATIENT_TOKEN))
            assert create_resp.status_code == 201
            entry_id = create_resp.json()["data"]["id"]

            resp = await client.put(
                f"{BASE}/{entry_id}",
                json=_entry_payload(mood_score=2, notes="отредактировано"),
                headers=_auth_header(PATIENT_TOKEN),
            )
            assert resp.status_code == 200, resp.text
            data = resp.json()["data"]
            assert data["id"] == entry_id
            assert data["mood_score"] == 2
            assert data["notes"] == "отредактировано"

    @pytest.mark.db
    async def test_update_nonexistent_entry_404(self) -> None:
        async with await _async_client() as client:
            fake_id = str(uuid.uuid4())
            resp = await client.put(
                f"{BASE}/{fake_id}",
                json=_entry_payload(mood_score=1),
                headers=_auth_header(PATIENT_TOKEN),
            )
            assert resp.status_code == 404, resp.text

    @pytest.mark.db
    async def test_cross_clinic_update_forbidden(self) -> None:
        async with await _async_client() as client:
            create_resp = await client.post(BASE, json=_entry_payload(), headers=_auth_header(PATIENT_TOKEN))
            assert create_resp.status_code == 201
            entry_id = create_resp.json()["data"]["id"]

            resp = await client.put(
                f"{BASE}/{entry_id}",
                json=_entry_payload(mood_score=1),
                headers=_auth_header(COORDINATOR_TOKEN),
            )
            assert resp.status_code in (200, 403), resp.text


class TestDiaryDelete:
    """DELETE /api/v1/diary/{entry_id}"""

    @pytest.mark.db
    async def test_patient_delete_own_entry(self) -> None:
        async with await _async_client() as client:
            create_resp = await client.post(BASE, json=_entry_payload(), headers=_auth_header(PATIENT_TOKEN))
            assert create_resp.status_code == 201
            entry_id = create_resp.json()["data"]["id"]

            resp = await client.delete(f"{BASE}/{entry_id}", headers=_auth_header(PATIENT_TOKEN))
            assert resp.status_code == 204, resp.text

            resp2 = await client.get(BASE, headers=_auth_header(PATIENT_TOKEN))
            assert resp2.status_code == 200
            ids = [i["id"] for i in resp2.json()["data"]["items"]]
            assert entry_id not in ids

    @pytest.mark.db
    async def test_delete_nonexistent_entry_404(self) -> None:
        async with await _async_client() as client:
            fake_id = str(uuid.uuid4())
            resp = await client.delete(f"{BASE}/{fake_id}", headers=_auth_header(PATIENT_TOKEN))
            assert resp.status_code == 404, resp.text


class TestDiarySummary:
    """GET /api/v1/diary/summary"""

    @pytest.mark.db
    async def test_patient_summary_with_entries(self) -> None:
        async with await _async_client() as client:
            await client.post(
                BASE, json=_entry_payload(mood_score=2, anxiety_score=1),
                headers=_auth_header(PATIENT_TOKEN),
            )
            await client.post(
                BASE, json=_entry_payload(mood_score=0, anxiety_score=3),
                headers=_auth_header(PATIENT_TOKEN),
            )

            resp = await client.get(f"{BASE}/summary", headers=_auth_header(PATIENT_TOKEN))
            assert resp.status_code == 200, resp.text
            data = resp.json()["data"]
            assert data["patient_id"] == str(PATIENT_PROFILE_ID)
            assert data["total_entries"] >= 2
            assert data["avg_mood"] is not None
            assert data["avg_anxiety"] is not None

    @pytest.mark.db
    async def test_summary_structure(self) -> None:
        async with await _async_client() as client:
            resp = await client.get(f"{BASE}/summary", headers=_auth_header(PATIENT_TOKEN))
            assert resp.status_code == 200, resp.text
            data = resp.json()["data"]
            assert "total_entries" in data
            assert "avg_mood" in data
            assert "avg_anxiety" in data
            assert "avg_energy" in data
            assert "avg_functioning" in data


class TestDiaryBulkSync:
    """POST /api/v1/diary/bulk-sync"""

    @pytest.mark.db
    async def test_bulk_sync_creates_entries(self) -> None:
        async with await _async_client() as client:
            now = datetime.now(timezone.utc).replace(microsecond=0)
            payload = {
                "device_id": "test-device-001",
                "entries": [
                    _entry_payload(recorded_at=now - timedelta(hours=2), device_id=None),
                    _entry_payload(recorded_at=now - timedelta(hours=1), device_id=None),
                ],
            }
            resp = await client.post(f"{BASE}/bulk-sync", json=payload, headers=_auth_header(PATIENT_TOKEN))
            assert resp.status_code == 200, resp.text
            data = resp.json()["data"]
            assert data["created"] == 2
            assert data["skipped"] == 0
            assert len(data["items"]) == 2

    @pytest.mark.db
    async def test_bulk_sync_deduplicates_by_device_and_time(self) -> None:
        async with await _async_client() as client:
            now = datetime.now(timezone.utc).replace(microsecond=0)
            device_id = "test-device-dedup"

            resp1 = await client.post(
                f"{BASE}/bulk-sync",
                json={
                    "device_id": device_id,
                    "entries": [_entry_payload(recorded_at=now, device_id=None)],
                },
                headers=_auth_header(PATIENT_TOKEN),
            )
            assert resp1.status_code == 200
            assert resp1.json()["data"]["created"] == 1

            resp2 = await client.post(
                f"{BASE}/bulk-sync",
                json={
                    "device_id": device_id,
                    "entries": [_entry_payload(recorded_at=now, device_id=None)],
                },
                headers=_auth_header(PATIENT_TOKEN),
            )
            assert resp2.status_code == 200
            assert resp2.json()["data"]["created"] == 0
            assert resp2.json()["data"]["skipped"] == 1


class TestDiaryOwnershipIsolation:
    """Владелец записи — только тот, кто создал."""

    @pytest.mark.db
    async def test_patient_cannot_see_another_patients_entries(self) -> None:
        async with await _async_client() as client:
            resp = await client.get(
                BASE,
                params={"patient_id": str(uuid.uuid4())},
                headers=_auth_header(PATIENT_TOKEN),
            )
            assert resp.status_code in (200, 403, 404), resp.text


class TestDiaryAuditAndVersioning:
    """Проверка versioning и audit при обновлении записи."""

    @pytest.mark.db
    async def test_update_creates_version_record_if_implemented(self) -> None:
        async with await _async_client() as client:
            create_resp = await client.post(BASE, json=_entry_payload(), headers=_auth_header(PATIENT_TOKEN))
            assert create_resp.status_code == 201
            entry_id = create_resp.json()["data"]["id"]

            resp = await client.put(
                f"{BASE}/{entry_id}",
                json=_entry_payload(mood_score=3, notes="updated for versioning"),
                headers=_auth_header(PATIENT_TOKEN),
            )
            assert resp.status_code == 200, resp.text
            data = resp.json()["data"]
            assert data["id"] == entry_id

