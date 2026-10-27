from fastapi import APIRouter, Depends, Query, Request, status
from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.common import EnvelopeResponse
from app.schemas.safety import SafetyPlanCreate, SafetyPlanUpdate, SafetyPlanResponse, CrisisSignalCreate, CrisisSignalResponse
from app.services.safety_service import SafetyPlanService

router = APIRouter(prefix="/api/v1/safety", tags=["safety"])

def _svc():
    return SafetyPlanService()

@router.get("/plans", status_code=200)
async def list_plans(current_user: CurrentUser, db: DbSession, request: Request, patient_id: str | None = Query(None), _perm=Depends(require_permission("safety:read"))):
    svc = _svc()
    data = await svc.list_plans(db, current_user, patient_id)
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}

@router.post("/plans", status_code=201)
async def create_plan(body: SafetyPlanCreate, current_user: CurrentUser, db: DbSession, request: Request, _perm=Depends(require_permission("safety:write"))):
    svc = _svc()
    result = await svc.create_plan(db, body.model_dump(), current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}

@router.get("/plans/{plan_id}", status_code=200)
async def get_plan(plan_id: str, current_user: CurrentUser, db: DbSession, request: Request, _perm=Depends(require_permission("safety:read"))):
    svc = _svc()
    result = await svc.get_plan(db, plan_id, current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}

@router.put("/plans/{plan_id}", status_code=200)
async def update_plan(plan_id: str, body: SafetyPlanUpdate, current_user: CurrentUser, db: DbSession, request: Request, _perm=Depends(require_permission("safety:write"))):
    svc = _svc()
    result = await svc.update_plan(db, plan_id, body.model_dump(exclude_unset=True), current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}

@router.delete("/plans/{plan_id}", status_code=204)
async def delete_plan(plan_id: str, current_user: CurrentUser, db: DbSession, request: Request, _perm=Depends(require_permission("safety:write"))):
    svc = _svc()
    await svc.delete_plan(db, plan_id, current_user)
    return None

@router.get("/crisis-signals", status_code=200)
async def list_signals(current_user: CurrentUser, db: DbSession, request: Request, patient_id: str | None = Query(None), _perm=Depends(require_permission("crisis:read"))):
    svc = _svc()
    data = await svc.list_signals(db, current_user, patient_id)
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}

@router.post("/crisis-signals", status_code=201)
async def create_signal(body: CrisisSignalCreate, current_user: CurrentUser, db: DbSession, request: Request, _perm=Depends(require_permission("crisis:write"))):
    svc = _svc()
    result = await svc.create_signal(db, body.model_dump(), current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}

@router.post("/crisis-signals/{signal_id}/acknowledge", status_code=200)
async def acknowledge_signal(signal_id: str, current_user: CurrentUser, db: DbSession, request: Request, _perm=Depends(require_permission("crisis:write"))):
    svc = _svc()
    result = await svc.acknowledge_signal(db, signal_id, current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}
