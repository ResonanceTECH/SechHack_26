"""FastAPI router for patient service endpoints."""

from fastapi import APIRouter, Query, Request, status

from app.api.dependencies import CurrentUser, DbSession
from app.schemas.common import EnvelopeResponse
from app.schemas.patient import PatientListItem, PatientDetail, PatientUpdate

from app.services.patient_service import PatientService


router = APIRouter(prefix="/api/v1/patients", tags=["patients"])


def _get_patient_service(db) -> PatientService:
    """Inject patient service dependency."""
    from app.repositories.patient_repository import PatientRepository

    return PatientService(PatientRepository())


@router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}})
async def get_patients(
    current_user: CurrentUser,
    db: DbSession,
    request: Request,
    search: str | None = Query(None, description="Поиск по имени/фамилии/email"),
    q: str | None = Query(None, description="Алиас для search"),
) -> dict:
    """Список пациентов текущего пользователя."""
    service = _get_patient_service(db)
    term = search if search is not None else q
    result = await service.list_patients(db, current_user, term)
    return {
        "data": result,
        "request_id": getattr(request.state, "request_id", ""),
    }


@router.get("/{patient_id}/home", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 404: {"description": "Пациент не найден"}})
async def get_patient_home(
    patient_id: str,
    current_user: CurrentUser,
    db: DbSession,
    request: Request,
) -> dict:
    """Агрегированное представление домашнего экрана пациента."""
    service = _get_patient_service(db)
    result = await service.get_patient_home(db, patient_id, current_user)
    return {
        "data": result,
        "request_id": getattr(request.state, "request_id", ""),
    }


@router.get("/{patient_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 404: {"description": "Пациент не найден"}})
async def get_patient(
    patient_id: str,
    current_user: CurrentUser,
    db: DbSession,
    request: Request,
) -> dict:
    """Карточка пациента по ID."""
    service = _get_patient_service(db)
    result = await service.get_patient(db, patient_id, current_user)
    return {
        "data": result,
        "request_id": getattr(request.state, "request_id", ""),
    }


@router.patch("/{patient_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 404: {"description": "Пациент не найден"}, 422: {"description": "Ошибка валидации"}})
async def update_patient(
    patient_id: str,
    body: PatientUpdate,
    current_user: CurrentUser,
    db: DbSession,
    request: Request,
) -> dict:
    """Обновление данных пациента."""
    service = _get_patient_service(db)
    result = await service.update_patient(db, patient_id, body, current_user)
    return {
        "data": result,
        "request_id": getattr(request.state, "request_id", ""),
    }


@router.get("/{patient_id}/summary", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 404: {"description": "Пациент не найден"}})
async def get_patient_summary(
    patient_id: str,
    current_user: CurrentUser,
    db: DbSession,
    request: Request,
) -> dict:
    """Сокращенная карточка пациента."""
    service = _get_patient_service(db)
    result = await service.get_patient_summary(db, patient_id, current_user)
    return {
        "data": result,
        "request_id": getattr(request.state, "request_id", ""),
    }
@router.get("/{patient_id}/card", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 404: {"description": "Пациент не найден"}})
async def get_patient_card(
    patient_id: str,
    current_user: CurrentUser,
    db: DbSession,
    request: Request,
) -> dict:
    """Агрегированная карточка пациента (tabs) для снижения N+1."""
    service = _get_patient_service(db)
    result = await service.get_patient_card(db, patient_id, current_user)
    return {
        "data": result,
        "request_id": getattr(request.state, "request_id", ""),
    }


@router.get("/{patient_id}/symptoms", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 404: {"description": "Пациент не найден"}})
async def get_patient_symptoms(
    patient_id: str,
    current_user: CurrentUser,
    db: DbSession,
    request: Request,
) -> dict:
    """Серия симптомов пациента за 30 дней (из дневника)."""
    from sqlalchemy import select
    from app.models.profile import PatientProfile
    from app.repositories.diary_repository import DiaryRepository
    from datetime import datetime, timezone, timedelta
    prof = await db.get(PatientProfile, __import__("uuid").UUID(patient_id))
    if prof is None:
        from app.core.errors import not_found
        raise not_found("Пациент не найден")
    # clinic isolation for practitioners
    if current_user.role != "patient":
        from app.services.clinic_isolation import practitioner_clinic_ids, patient_clinic_id, enforce_clinic_match
        p_clinics = await practitioner_clinic_ids(db, current_user)
        pat_clinic = await patient_clinic_id(db, patient_id)
        enforce_clinic_match(p_clinics, pat_clinic)
    else:
        own = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))).scalar_one_or_none()
        if own is None or str(own.id) != str(patient_id):
            from app.core.errors import forbidden
            raise forbidden()
    repo = DiaryRepository()
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)
    rows = await repo.list_for_patient(db, patient_id, start, end)
    items = []
    for r in rows:
        items.append({
            "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None,
            "mood_score": r.mood_score,
            "anxiety_score": r.anxiety_score,
            "energy_score": r.energy_score,
            "functioning_score": r.functioning_score,
            "sleep_hours": r.sleep_hours,
            "sleep_quality": r.sleep_quality,
        })
    return {"data": {"patient_id": patient_id, "items": items, "total": len(items)}, "request_id": getattr(request.state, "request_id", "")}
