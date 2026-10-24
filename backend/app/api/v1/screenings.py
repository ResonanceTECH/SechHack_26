from fastapi import APIRouter, Depends, Query, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.common import EnvelopeResponse
from app.schemas.screening import (
    ScreeningCreateRequest,
    ScreeningResponse,
    ScreeningListItem,
    ScreeningHistoryResponse,
    QuestionnaireInfo,
)
from app.core.questionnaire_registry import get_definition, list_codes
from app.core.errors import forbidden, not_found, validation_error
from app.services.screening_service import ScreeningService
from app.repositories.screening_repository import ScreeningRepository
from app.models.profile import PatientProfile, PractitionerProfile
from sqlalchemy import select

router = APIRouter(prefix="/api/v1/screenings", tags=["screenings"])


def _get_service() -> ScreeningService:
    return ScreeningService()


@router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("screening:read"))])
async def list_questionnaires(request: Request) -> dict:
    """Список вопросников из реестра (все поддерживаемые)."""
    items = []
    for code in list_codes():
        defn = get_definition(code)
        if defn is None:
            continue
        items.append(QuestionnaireInfo(code=defn.code, title=defn.title, questions_count=len(defn.questions),
                                     max_score=defn.max_score, version=defn.version).model_dump())
    return {"data": {"questionnaires": items}, "request_id": getattr(request.state, "request_id", "")}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
             dependencies=[Depends(require_permission("screening:write"))])
async def create_screening(body: ScreeningCreateRequest, current_user: CurrentUser, db: DbSession, request: Request) -> dict:
    service = _get_service()
    data = body.model_dump()
    result = await service.create_screening(db, current_user, data)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.get("/{screening_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("screening:read"))])
async def get_screening(screening_id: str, current_user: CurrentUser, db: DbSession, request: Request) -> dict:
    repo = ScreeningRepository()
    row = await repo.get_by_id(db, screening_id)
    if row is None:
        from app.core.errors import not_found
        raise not_found("???????? ?? ??????")
    # patient can read only own
    if current_user.role == "patient":
        profile = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))).scalar_one_or_none()
        if profile is None or str(profile.id) != str(row.patient_id):
            from app.core.errors import forbidden
            raise forbidden()
    service = _get_service()
    defn = get_definition(row.questionnaire_type, row.questionnaire_version)
    interpretation = defn.severity_for(row.score) if defn is not None else row.severity
    result = ScreeningResponse(
        id=str(row.id), patient_id=str(row.patient_id), questionnaire_type=row.questionnaire_type,
        questionnaire_version=row.questionnaire_version, score=row.score, answers=row.answers,
        is_critical=row.is_critical, severity=row.severity, critical_reason=row.critical_reason, interpretation=interpretation, created_at=row.created_at.isoformat() if row.created_at else None,
    ).model_dump()
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


# patient screenings history endpoint mounted under patients router? Add separate router in patients? We'll add here with full path.

patient_screenings_router = APIRouter(prefix="/api/v1/patients", tags=["screenings"])

@patient_screenings_router.get("/{patient_id}/screenings", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                               dependencies=[Depends(require_permission("screening:read"))])
async def get_patient_screenings(patient_id: str, current_user: CurrentUser, db: DbSession, request: Request) -> dict:
    # patient can read only own
    if current_user.role == "patient":
        profile = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))).scalar_one_or_none()
        if profile is None or str(profile.id) != str(patient_id):
            from app.core.errors import forbidden
            raise forbidden()
    # clinic isolation for practitioners
    if current_user.role not in ("patient", "super_admin"):
        import uuid as _uuid
        try:
            pid = _uuid.UUID(patient_id)
        except ValueError:
            raise not_found("Пациент не найден")
        pat_profile = (await db.execute(select(PatientProfile).where(PatientProfile.id == pid))).scalar_one_or_none()
        if pat_profile is None:
            raise not_found("Пациент не найден")
        prac = (await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == current_user.id))).scalar_one_or_none()
        if prac is not None and pat_profile.clinic_id is not None and prac.clinic_id != pat_profile.clinic_id:
            raise forbidden()
    repo = ScreeningRepository()
    rows = await repo.get_patient_screenings(db, patient_id)
    items = [ScreeningListItem(id=str(r.id), questionnaire_type=r.questionnaire_type, score=r.score,
                               is_critical=r.is_critical, created_at=r.created_at.isoformat() if r.created_at else None).model_dump() for r in rows]
    result = ScreeningHistoryResponse(items=items, total=len(items)).model_dump()
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}
@patient_screenings_router.get("/{patient_id}/screening-trend", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                               dependencies=[Depends(require_permission("screening:read"))])
async def get_patient_screening_trend(patient_id: str, current_user: CurrentUser, db: DbSession, request: Request,
                                      questionnaire_code: str = Query(...), limit: int = Query(20, ge=1, le=100)) -> dict:
    if get_definition(questionnaire_code) is None:
        raise validation_error("Неизвестный опросник")
    if current_user.role == "patient":
        profile = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))).scalar_one_or_none()
        if profile is None or str(profile.id) != str(patient_id):
            raise forbidden()
    elif current_user.role != "super_admin":
        import uuid as _uuid
        try:
            pid = _uuid.UUID(patient_id)
        except ValueError:
            raise not_found("Пациент не найден")
        pat_profile = (await db.execute(select(PatientProfile).where(PatientProfile.id == pid))).scalar_one_or_none()
        if pat_profile is None:
            raise not_found("Пациент не найден")
        prac = (await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == current_user.id))).scalar_one_or_none()
        if prac is not None and pat_profile.clinic_id is not None and prac.clinic_id != pat_profile.clinic_id:
            raise forbidden()
    repo = ScreeningRepository()
    rows = await repo.get_patient_screenings(db, patient_id)
    filtered = [r for r in rows if r.questionnaire_type == questionnaire_code][:limit]
    filtered_sorted = sorted(filtered, key=lambda r: r.created_at or 0)
    items = [{"id": str(r.id), "score": r.score, "severity": r.severity,
              "is_critical": r.is_critical, "created_at": r.created_at.isoformat() if r.created_at else None} for r in filtered_sorted]
    scores = [r.score for r in filtered_sorted]
    if len(scores) >= 2:
        delta = scores[-1] - scores[0]
        if delta <= -2:
            direction = "improving"
        elif delta >= 2:
            direction = "worsening"
        else:
            direction = "stable"
    else:
        delta = 0
        direction = "insufficient_data"
    avg = round(sum(scores) / len(scores), 2) if scores else None
    result = {
        "patient_id": patient_id,
        "questionnaire_code": questionnaire_code,
        "total": len(items),
        "average_score": avg,
        "first_score": scores[0] if scores else None,
        "last_score": scores[-1] if scores else None,
        "delta": delta,
        "trend": direction,
        "items": items,
    }
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}
