"""Diagnosis API endpoints."""

from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.common import EnvelopeResponse
from app.schemas.diagnosis import DiagnosisCreate, DiagnosisUpdate
from app.services.diagnosis_service import DiagnosisService
from app.repositories.diagnosis_repository import DiagnosisRepository
from app.models.profile import PatientProfile
from sqlalchemy import select

router = APIRouter(prefix="/api/v1/diagnoses", tags=["diagnoses"])
patient_diagnoses_router = APIRouter(prefix="/api/v1/patients", tags=["diagnoses"])
icd10_router = APIRouter(prefix="/api/v1/icd10", tags=["icd10 (deprecated)"])


def _svc() -> DiagnosisService:
    return DiagnosisService(DiagnosisRepository())


@router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("diagnosis:read"))])
async def list_diagnoses(request: Request, current_user: CurrentUser, db: DbSession, patient_id: str | None = None, coding_system: str | None = None) -> dict:
    service = _svc()
    result = await service.list_diagnoses(db, current_user, patient_id, coding_system)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
             dependencies=[Depends(require_permission("diagnosis:write"))])
async def create_diagnosis(body: DiagnosisCreate, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    service = _svc()
    result = await service.create_diagnosis(db, current_user, body.model_dump())
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.get("/{diagnosis_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("diagnosis:read"))])
async def get_diagnosis(diagnosis_id: str, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    service = _svc()
    result = await service.get_diagnosis(db, diagnosis_id, current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.put("/{diagnosis_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("diagnosis:write"))])
async def update_diagnosis(diagnosis_id: str, body: DiagnosisUpdate, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    service = _svc()
    result = await service.update_diagnosis(db, diagnosis_id, body.model_dump(exclude_unset=True), current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@patient_diagnoses_router.get("/{patient_id}/diagnoses", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                              dependencies=[Depends(require_permission("diagnosis:read"))])
async def get_patient_diagnoses(patient_id: str, request: Request, current_user: CurrentUser, db: DbSession, coding_system: str | None = None) -> dict:
    service = _svc()
    result = await service.list_patient_diagnoses(db, patient_id, current_user, coding_system)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@icd10_router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                  dependencies=[Depends(require_permission("diagnosis:read"))])
async def list_icd10(request: Request, current_user: CurrentUser, db: DbSession, patient_id: str | None = None) -> dict:
    service = _svc()
    result = await service.list_diagnoses(db, current_user, patient_id, "ICD10")
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@icd10_router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
                   dependencies=[Depends(require_permission("diagnosis:write"))])
async def create_icd10(body: DiagnosisCreate, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    payload = body.model_dump()
    payload["coding_system"] = "ICD10"
    service = _svc()
    result = await service.create_diagnosis(db, current_user, payload)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@icd10_router.get("/{diagnosis_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                  dependencies=[Depends(require_permission("diagnosis:read"))])
async def get_icd10(diagnosis_id: str, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    service = _svc()
    result = await service.get_diagnosis(db, diagnosis_id, current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@icd10_router.put("/{diagnosis_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                  dependencies=[Depends(require_permission("diagnosis:write"))])
async def update_icd10(diagnosis_id: str, body: DiagnosisUpdate, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    service = _svc()
    result = await service.update_diagnosis(db, diagnosis_id, body.model_dump(exclude_unset=True), current_user)
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}
