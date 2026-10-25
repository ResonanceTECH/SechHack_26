"""Negative cross-clinic isolation tests."""

from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from fastapi import status

from app.core.security import jwt as jwt_service
from app.db.session import session_factory
from app.models.clinic import Clinic
from app.models.profile import PatientProfile
from app.models.user import User

DOCTOR_USER_ID = UUID("ba827169-c584-4186-a357-2e6a8bd8d04e")
DOCTOR_TOKEN = jwt_service.create_access_token(user_id=DOCTOR_USER_ID, role="doctor")


async def _create_other_clinic_patient() -> tuple[UUID, UUID, UUID]:
    async with session_factory() as session:
        clinic = Clinic(name=f"Other clinic {uuid4()}")
        session.add(clinic)
        await session.commit()
        await session.refresh(clinic)

        user = User(email=f"cross-{uuid4()}@example.com", role="patient")
        session.add(user)
        await session.commit()
        await session.refresh(user)

        profile = PatientProfile(
            user_id=user.id,
            first_name="Cross",
            last_name="Clinic",
            consent_personal_data=True,
            consent_medical_data=True,
            clinic_id=clinic.id,
        )
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
        return clinic.id, user.id, profile.id


async def _cleanup(clinic_id: UUID, user_id: UUID, profile_id: UUID) -> None:
    async with session_factory() as session:
        profile = await session.get(PatientProfile, profile_id)
        if profile is not None:
            await session.delete(profile)
        user = await session.get(User, user_id)
        if user is not None:
            await session.delete(user)
        clinic = await session.get(Clinic, clinic_id)
        if clinic is not None:
            await session.delete(clinic)
        await session.commit()


@pytest.mark.db
@pytest.mark.asyncio
async def test_cross_clinic_patient_detail_forbidden():
    clinic_id, user_id, profile_id = await _create_other_clinic_patient()
    try:
        from httpx import AsyncClient, ASGITransport
        from app.main import app

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                f"/api/v1/patients/{profile_id}",
                headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"},
            )
            assert resp.status_code == status.HTTP_403_FORBIDDEN
    finally:
        await _cleanup(clinic_id, user_id, profile_id)


@pytest.mark.db
@pytest.mark.asyncio
async def test_cross_clinic_screening_trend_forbidden():
    clinic_id, user_id, profile_id = await _create_other_clinic_patient()
    try:
        from httpx import AsyncClient, ASGITransport
        from app.main import app

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                f"/api/v1/patients/{profile_id}/screening-trend?questionnaire_code=phq9",
                headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"},
            )
            assert resp.status_code == status.HTTP_403_FORBIDDEN
    finally:
        await _cleanup(clinic_id, user_id, profile_id)


@pytest.mark.db
@pytest.mark.asyncio
async def test_cross_clinic_patient_summary_forbidden():
    clinic_id, user_id, profile_id = await _create_other_clinic_patient()
    try:
        from httpx import AsyncClient, ASGITransport
        from app.main import app

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                f"/api/v1/patients/{profile_id}/summary",
                headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"},
            )
            assert resp.status_code == status.HTTP_403_FORBIDDEN
    finally:
        await _cleanup(clinic_id, user_id, profile_id)


@pytest.mark.db
@pytest.mark.asyncio
async def test_cross_clinic_diary_list_forbidden():
    clinic_id, user_id, profile_id = await _create_other_clinic_patient()
    try:
        from httpx import AsyncClient, ASGITransport
        from app.main import app

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                f"/api/v1/diary?patient_id={profile_id}",
                headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"},
            )
            assert resp.status_code == status.HTTP_403_FORBIDDEN
    finally:
        await _cleanup(clinic_id, user_id, profile_id)


@pytest.mark.db
@pytest.mark.asyncio
async def test_cross_clinic_diary_summary_forbidden():
    clinic_id, user_id, profile_id = await _create_other_clinic_patient()
    try:
        from httpx import AsyncClient, ASGITransport
        from app.main import app

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                f"/api/v1/diary/summary?patient_id={profile_id}",
                headers={"Authorization": f"Bearer {DOCTOR_TOKEN}"},
            )
            assert resp.status_code == status.HTTP_403_FORBIDDEN
    finally:
        await _cleanup(clinic_id, user_id, profile_id)

