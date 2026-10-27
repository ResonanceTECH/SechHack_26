import pytest
from app.db.session import session_factory
from app.repositories.screening_repository import ScreeningRepository

PATIENT_PROFILE_ID = "705fa5d0-acfa-40e8-88d7-e4c516aa1048"

@pytest.mark.db
@pytest.mark.asyncio
async def test_repo_create_and_list():
    repo = ScreeningRepository()
    async with session_factory() as db:
        row = await repo.create_screening(db, PATIENT_PROFILE_ID, "gad7", "1.0", 5, [1,1,1,1,1,0,0], False)
        assert row.id is not None
        items = await repo.get_patient_screenings(db, PATIENT_PROFILE_ID)
        assert len(items) >= 1
        latest = await repo.get_latest_screening(db, PATIENT_PROFILE_ID)
        assert latest is not None


@pytest.mark.db
@pytest.mark.asyncio
async def test_repo_create_new_registry_questionnaires():
    repo = ScreeningRepository()
    cases = [
        ("hcl8", "1.0", 3, [1, 1, 1, 0, 0, 0, 0, 0]),
        ("pdss", "1.0", 5, [1, 1, 1, 1, 1, 0, 0]),
        ("cssrs", "1.0", 2, [1, 1, 0, 0, 0, 0]),
        ("isi", "1.0", 10, [2, 2, 2, 1, 1, 1, 1]),
        ("hcl33", "1.0", 15, [1] * 15 + [0] * 18),
    ]
    async with session_factory() as db:
        for code, version, score, answers in cases:
            row = await repo.create_screening(
                db, PATIENT_PROFILE_ID, code, version, score, answers, False
            )
            assert row.id is not None
            assert row.questionnaire_type == code
            assert row.score == score
