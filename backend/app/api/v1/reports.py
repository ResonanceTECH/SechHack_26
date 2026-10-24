"""Reports API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.common import EnvelopeResponse
from app.schemas.report import ClinicAnalyticsResponse, PreVisitReportResponse
from app.services.report_service import ReportService


reports_router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


def _svc() -> ReportService:
    return ReportService()


@reports_router.get(
    "/pre-visit/{patient_id}",
    status_code=status.HTTP_200_OK,
    response_model=EnvelopeResponse,
    dependencies=[Depends(require_permission("report:read"))],
)
async def pre_visit_report(request: Request, current_user: CurrentUser, db: DbSession, patient_id: str):
    svc = _svc()
    data = await svc.pre_visit_report(db, patient_id)
    if data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}


@reports_router.get(
    "/clinic-analytics",
    status_code=status.HTTP_200_OK,
    response_model=EnvelopeResponse,
    dependencies=[Depends(require_permission("report:read"))],
)
async def clinic_analytics(request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    data = await svc.clinic_analytics(db)
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}
