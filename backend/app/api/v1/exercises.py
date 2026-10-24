"""Exercises / care plans API."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.common import EnvelopeResponse
from app.schemas.exercise import (
    CarePlanCreate,
    CarePlanResponse,
    CarePlanListResponse,
    ExerciseAssignmentCreate,
    ExerciseAssignmentUpdate,
    ExerciseAssignmentResponse,
    ExerciseAssignmentListResponse,
    ExerciseCompletionCreate,
    ExerciseCompletionResponse,
    ComplianceResponse,
)
from app.services.exercise_service import ExerciseService
from app.repositories.exercise_repository import ExerciseRepository


care_plans_router = APIRouter(prefix="/api/v1/care-plans", tags=["care-plans"])
exercises_router = APIRouter(prefix="/api/v1/exercises", tags=["exercises"])


def _svc() -> ExerciseService:
    return ExerciseService(ExerciseRepository())


async def _patient_id_for_assignment(svc, db, a) -> Optional[str]:
    cp = await svc.repo.get_care_plan(db, str(a.care_plan_id))
    return str(cp.patient_id) if cp else None


@care_plans_router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def list_care_plans(request: Request, current_user: CurrentUser, db: DbSession, patient_id: Optional[str] = None):
    svc = _svc()
    items = await svc.list_care_plans(db, current_user, patient_id)
    data = [CarePlanResponse.model_validate(c).model_dump() for c in items]
    return {"data": {"items": data, "total": len(data)}, "request_id": getattr(request.state, "request_id", "")}


@care_plans_router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
                        dependencies=[Depends(require_permission("exercise:assign"))])
async def create_care_plan(body: CarePlanCreate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    try:
        row = await svc.create_care_plan(db, current_user, body.model_dump())
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))
    return {"data": CarePlanResponse.model_validate(row).model_dump(), "request_id": getattr(request.state, "request_id", "")}


@exercises_router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def list_exercises(request: Request, current_user: CurrentUser, db: DbSession, patient_id: Optional[str] = None):
    svc = _svc()
    items = await svc.list_exercises(db, current_user, patient_id)
    data = []
    for a in items:
        pid = await _patient_id_for_assignment(svc, db, a)
        resp = ExerciseAssignmentResponse.model_validate(a)
        resp.patient_id = pid
        data.append(resp.model_dump())
    return {"data": {"items": data, "total": len(data)}, "request_id": getattr(request.state, "request_id", "")}


@exercises_router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
                       dependencies=[Depends(require_permission("exercise:assign"))])
async def create_exercise(body: ExerciseAssignmentCreate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    try:
        row = await svc.create_exercise(db, current_user, body.model_dump())
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))
    pid = await _patient_id_for_assignment(svc, db, row)
    resp = ExerciseAssignmentResponse.model_validate(row)
    resp.patient_id = pid
    return {"data": resp.model_dump(), "request_id": getattr(request.state, "request_id", "")}


@exercises_router.put("/{assignment_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                      dependencies=[Depends(require_permission("exercise:assign"))])
async def update_exercise(assignment_id: str, body: ExerciseAssignmentUpdate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.update_exercise(db, assignment_id, body.model_dump(exclude_unset=True), current_user)
    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Exercise not found")
    pid = await _patient_id_for_assignment(svc, db, row)
    resp = ExerciseAssignmentResponse.model_validate(row)
    resp.patient_id = pid
    return {"data": resp.model_dump(), "request_id": getattr(request.state, "request_id", "")}


@exercises_router.post("/{assignment_id}/complete", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
                       dependencies=[Depends(require_permission("exercise:complete"))])
async def complete_exercise(assignment_id: str, body: ExerciseCompletionCreate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    try:
        row = await svc.complete_exercise(db, current_user, assignment_id, body.model_dump())
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))
    return {"data": ExerciseCompletionResponse.model_validate(row).model_dump(), "request_id": getattr(request.state, "request_id", "")}


@exercises_router.get("/{assignment_id}/compliance", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                      dependencies=[Depends(require_permission("exercise:assign"))])
async def exercise_compliance(assignment_id: str, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    data = await svc.compliance(db, assignment_id, current_user)
    return {"data": ComplianceResponse.model_validate(data).model_dump(), "request_id": getattr(request.state, "request_id", "")}
