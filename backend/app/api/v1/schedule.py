"""Schedule and clinic settings API endpoints."""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.schedule import (
    ClinicSettingsResponse,
    ClinicSettingsUpdate,
    PractitionerScheduleEntry,
    PractitionerScheduleResponse,
    PractitionerScheduleExceptionCreate,
    PractitionerScheduleExceptionResponse,
)
from app.schemas.common import EnvelopeResponse
from app.services.schedule_service import ScheduleService
from app.repositories.schedule_repository import ScheduleRepository


schedule_router = APIRouter(prefix="/api/v1", tags=["schedule"])


def _svc() -> ScheduleService:
    return ScheduleService(ScheduleRepository())


@schedule_router.get("/clinics/{clinic_id}/settings", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                   dependencies=[Depends(require_permission("clinic_settings:read"))])
async def get_clinic_settings(clinic_id: str, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.get_clinic_settings(db, clinic_id)
    if row is None:
        # create default
        row = await svc.update_clinic_settings(db, clinic_id, "Europe/Moscow")
        await db.commit()
    data = ClinicSettingsResponse(id=str(row.id), clinic_id=str(row.clinic_id), timezone=row.timezone).model_dump()
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}


@schedule_router.put("/clinics/{clinic_id}/settings", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                   dependencies=[Depends(require_permission("clinic_settings:write"))])
async def update_clinic_settings(clinic_id: str, body: ClinicSettingsUpdate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.update_clinic_settings(db, clinic_id, body.timezone)
    await db.commit()
    data = ClinicSettingsResponse(id=str(row.id), clinic_id=str(row.clinic_id), timezone=row.timezone).model_dump()
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}


@schedule_router.get("/practitioners/{practitioner_id}/schedule", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                   dependencies=[Depends(require_permission("schedule:read"))])
async def get_schedule(practitioner_id: str, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    rows = await svc.get_schedule(db, practitioner_id)
    data = [PractitionerScheduleResponse(id=str(r.id), practitioner_id=str(r.practitioner_id), weekday=r.weekday, start_time=r.start_time, end_time=r.end_time, is_available=r.is_available).model_dump() for r in rows]
    return {"data": {"items": data, "total": len(data)}, "request_id": getattr(request.state, "request_id", "")}


@schedule_router.put("/practitioners/{practitioner_id}/schedule", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                   dependencies=[Depends(require_permission("schedule:write"))])
async def replace_schedule(practitioner_id: str, body: List[PractitionerScheduleEntry], request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    entries = [e.model_dump() for e in body]
    rows = await svc.replace_schedule(db, practitioner_id, entries)
    await db.commit()
    data = [PractitionerScheduleResponse(id=str(r.id), practitioner_id=str(r.practitioner_id), weekday=r.weekday, start_time=r.start_time, end_time=r.end_time, is_available=r.is_available).model_dump() for r in rows]
    return {"data": {"items": data, "total": len(data)}, "request_id": getattr(request.state, "request_id", "")}


@schedule_router.post("/practitioners/{practitioner_id}/schedule/exceptions", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
                   dependencies=[Depends(require_permission("schedule:write"))])
async def add_exception(practitioner_id: str, body: PractitionerScheduleExceptionCreate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.add_exception(db, practitioner_id, body.model_dump())
    await db.commit()
    data = PractitionerScheduleExceptionResponse(id=str(row.id), practitioner_id=str(row.practitioner_id), date=row.date, start_time=row.start_time, end_time=row.end_time, is_available=row.is_available, reason=row.reason).model_dump()
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}


@schedule_router.delete("/practitioners/{practitioner_id}/schedule/exceptions/{exception_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                   dependencies=[Depends(require_permission("schedule:write"))])
async def delete_exception(practitioner_id: str, exception_id: str, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    await svc.delete_exception(db, exception_id)
    await db.commit()
    return {"data": {"deleted": True}, "request_id": getattr(request.state, "request_id", "")}
