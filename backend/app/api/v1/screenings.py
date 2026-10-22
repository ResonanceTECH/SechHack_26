from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.common import EnvelopeResponse
from app.schemas.screening import (
    ScreeningCreateRequest,
    ScreeningResponse,
    ScreeningListItem,
    ScreeningHistoryResponse,
    QuestionnaireInfo,
)
from app.core.questionnaires import QUESTIONNAIRES
from app.services.screening_service import ScreeningService
from app.repositories.screening_repository import ScreeningRepository
from app.models.profile import PatientProfile
from sqlalchemy import select

router = APIRouter(prefix="/api/v1/screenings", tags=["screenings"])


def _get_service() -> ScreeningService:
    return ScreeningService()


@router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("screening:read"))])
async def list_questionnaires(request: Request) -> dict:
    """?????? ????????? ?????????? (PHQ-9, GAD-7)."""
    items = [QuestionnaireInfo(code=v["code"], title=v["title"], questions_count=v["questions_count"],
                               max_score=v["max_score"], version=v["version"]).model_dump() for v in QUESTIONNAIRES.values()]
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
    interpretation = service.interpret_phq9(row.score) if row.questionnaire_type == "phq9" else service.interpret_gad7(row.score)
    result = ScreeningResponse(
        id=str(row.id), patient_id=str(row.patient_id), questionnaire_type=row.questionnaire_type,
        questionnaire_version=row.questionnaire_version, score=row.score, answers=row.answers,
        is_critical=row.is_critical, interpretation=interpretation, created_at=row.created_at.isoformat() if row.created_at else None,
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
    repo = ScreeningRepository()
    rows = await repo.get_patient_screenings(db, patient_id)
    items = [ScreeningListItem(id=str(r.id), questionnaire_type=r.questionnaire_type, score=r.score,
                               is_critical=r.is_critical, created_at=r.created_at.isoformat() if r.created_at else None).model_dump() for r in rows]
    result = ScreeningHistoryResponse(items=items, total=len(items)).model_dump()
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}
