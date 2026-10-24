"""Appointments API endpoints."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.schemas.common import EnvelopeResponse
from app.services.appointment_service import AppointmentService
from app.repositories.appointment_repository import AppointmentRepository


appointments_router = APIRouter(prefix="/api/v1/appointments", tags=["appointments"])


def _svc() -> AppointmentService:
    return AppointmentService(AppointmentRepository())


@appointments_router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                      dependencies=[Depends(require_permission("appointment:read"))])
async def list_appointments(request: Request, current_user: CurrentUser, db: DbSession, patient_id: Optional[str] = None):
    svc = _svc()
    items = await svc.list_appointments(db, current_user, patient_id)
    data = [AppointmentResponse.model_validate(a).model_dump() for a in items]
    return {"data": {"items": data, "total": len(data)}, "request_id": getattr(request.state, "request_id", "")}


@appointments_router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
                        dependencies=[Depends(require_permission("appointment:write"))])
async def create_appointment(body: AppointmentCreate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.create_appointment(db, current_user, body.model_dump())
    return {"data": AppointmentResponse.model_validate(row).model_dump(), "request_id": getattr(request.state, "request_id", "")}