"""Assessment plan API endpoints."""

from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.assessment_plan import (
    AssessmentPlanCreate,
    AssessmentPlanUpdate,
    AssessmentPlanResponse,
)
from app.schemas.common import EnvelopeResponse
from app.services.assessment_plan_service import AssessmentPlanService
from app.repositories.assessment_plan_repository import AssessmentPlanRepository

router = APIRouter(prefix="/api/v1/assessment-plans", tags=["assessment-plans"])


def _svc() -> AssessmentPlanService:
    return AssessmentPlanService(AssessmentPlanRepository())


@router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("assessment:read"))])
async def list_assessment_plans(request: Request, current_user: CurrentUser, db: DbSession, patient_id: str | None = None) -> dict:
    service = _svc()
    result = await service.list_plans(db, current_user, patient_id)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
             dependencies=[Depends(require_permission("assessment:write"))])
async def create_assessment_plan(body: AssessmentPlanCreate, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    service = _svc()
    result = await service.create_plan(db, current_user, body.model_dump())
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.get("/{plan_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("assessment:read"))])
async def get_assessment_plan(plan_id: str, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    service = _svc()
    result = await service.get_plan(db, plan_id, current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.put("/{plan_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("assessment:write"))])
async def update_assessment_plan(plan_id: str, body: AssessmentPlanUpdate, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    service = _svc()
    result = await service.update_plan(db, plan_id, body.model_dump(exclude_unset=True), current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_permission("assessment:write"))])
async def delete_assessment_plan(plan_id: str, request: Request, current_user: CurrentUser, db: DbSession) -> None:
    service = _svc()
    await service.delete_plan(db, plan_id, current_user)
    return None
