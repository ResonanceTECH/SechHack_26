from fastapi import APIRouter, Depends, Query, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.common import EnvelopeResponse
from app.schemas.alert import AlertUpdate, AlertResponse, SafetyPlanResponse
from app.services.alert_service import AlertService


router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


def _get_service(db):
    from app.repositories.alert_repository import AlertRepository
    return AlertService(AlertRepository())


@router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 403: {"description": "Недостаточно прав"}})
async def list_alerts(
    current_user: CurrentUser,
    db: DbSession,
    request: Request,
    _perm=Depends(require_permission("alert:read")),
    patient_id: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    priority: str | None = Query(None),
    alert_type: str | None = Query(None, alias="type"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    service = _get_service(db)
    filters = {}
    if patient_id:
        filters["patient_id"] = patient_id
    if status_filter:
        filters["status"] = status_filter
    if priority:
        filters["priority"] = priority
    if alert_type:
        filters["type"] = alert_type
    alerts, total = await service.list_alerts(db, current_user, filters, limit=limit, offset=offset)
    return {"data": {"alerts": alerts, "total": total, "limit": limit, "offset": offset}, "request_id": getattr(request.state, "request_id", "")}


@router.get("/{alert_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 403: {"description": "Недостаточно прав"}, 404: {"description": "Алерт не найден"}})
async def get_alert(alert_id: str, current_user: CurrentUser, db: DbSession, request: Request, _perm=Depends(require_permission("alert:read"))):
    service = _get_service(db)
    result = await service.get_alert(db, alert_id, current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.put("/{alert_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 403: {"description": "Недостаточно прав"}, 404: {"description": "Алерт не найден"}})
async def update_alert_put(alert_id: str, body: AlertUpdate, current_user: CurrentUser, db: DbSession, request: Request, _perm=Depends(require_permission("alert:read"))):
    service = _get_service(db)
    data = body.model_dump(exclude_unset=True)
    if "status" not in data:
        data["status"] = "in_progress"
    result = await service.update_alert(db, alert_id, current_user, data)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.patch("/{alert_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 403: {"description": "Недостаточно прав"}, 404: {"description": "Алерт не найден"}})
async def update_alert_patch(alert_id: str, body: AlertUpdate, current_user: CurrentUser, db: DbSession, request: Request, _perm=Depends(require_permission("alert:read"))):
    service = _get_service(db)
    data = body.model_dump(exclude_unset=True)
    result = await service.update_alert(db, alert_id, current_user, data)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.get("/{alert_id}/safety-plan", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 403: {"description": "Недостаточно прав"}, 404: {"description": "Алерт не найден"}})
async def safety_plan(alert_id: str, current_user: CurrentUser, db: DbSession, request: Request, _perm=Depends(require_permission("alert:read"))):
    service = _get_service(db)
    result = await service.get_safety_plan(db, alert_id, current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}
