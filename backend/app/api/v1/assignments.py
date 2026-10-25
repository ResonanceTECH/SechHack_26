"""Assignments API."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.common import EnvelopeResponse
from app.services.assignment_service import AssignmentService
from app.repositories.assignment_repository import AssignmentRepository
import uuid

assignments_router = APIRouter(prefix="/api/v1/assignments", tags=["assignments"])


class AssignmentCreate(BaseModel):
    patient_id: str
    practitioner_id: str
    clinic_id: str


def _svc():
    return AssignmentService(AssignmentRepository())


@assignments_router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
                        dependencies=[Depends(require_permission("patient:write"))])
async def create_assignment(body: AssignmentCreate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.create(db, current_user, body.model_dump())
    from app.services import audit_service as audit_svc
    await audit_svc.record(db, user_id=current_user.id, action="patient_assignment.create", entity_type="patient_assignment", entity_id=row.id, new_values=body.model_dump(), commit=True)
    return {"data": {"id": str(row.id), "patient_id": str(row.patient_id), "practitioner_id": str(row.practitioner_id), "clinic_id": str(row.clinic_id), "is_active": row.is_active}, "request_id": getattr(request.state, "request_id", "")}


@assignments_router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def list_assignments(request: Request, current_user: CurrentUser, db: DbSession, patient_id: Optional[str] = None, practitioner_id: Optional[str] = None):
    svc = _svc()
    items = await svc.list(db, current_user, patient_id, practitioner_id)
    data = [{"id": str(a.id), "patient_id": str(a.patient_id), "practitioner_id": str(a.practitioner_id), "clinic_id": str(a.clinic_id), "is_active": a.is_active} for a in items]
    return {"data": {"items": data, "total": len(data)}, "request_id": getattr(request.state, "request_id", "")}


@assignments_router.post("/{assignment_id}/deactivate", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                        dependencies=[Depends(require_permission("patient:write"))])
async def deactivate_assignment(assignment_id: str, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.deactivate(db, current_user, assignment_id)
    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Assignment not found")
    from app.services import audit_service as audit_svc
    await audit_svc.record(db, user_id=current_user.id, action="patient_assignment.deactivate", entity_type="patient_assignment", entity_id=row.id, old_values={"is_active": True}, new_values={"is_active": False}, commit=True)
    return {"data": {"id": str(row.id), "is_active": row.is_active}, "request_id": getattr(request.state, "request_id", "")}

