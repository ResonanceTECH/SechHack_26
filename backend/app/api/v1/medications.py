"""Medications API endpoints."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.core.permissions import has_permission
from app.schemas.medication import (
    MedicationCreate,
    MedicationUpdate,
    MedicationFullResponse,
    MedicationBriefResponse,
    PrescriptionCreate,
    PrescriptionUpdate,
    PrescriptionResponse,
    AdherenceCreate,
    AdherenceUpdate,
    AdherenceResponse,
)
from app.schemas.common import EnvelopeResponse
from app.services.medication_service import MedicationService
from app.repositories.medication_repository import MedicationRepository

medications_router = APIRouter(prefix="/api/v1/medications", tags=["medications"])
prescriptions_router = APIRouter(prefix="/api/v1/prescriptions", tags=["prescriptions"])
adherence_router = APIRouter(prefix="/api/v1/adherence", tags=["adherence"])


def _svc() -> MedicationService:
    return MedicationService(MedicationRepository())


@medications_router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def list_medications(request: Request, current_user: CurrentUser, db: DbSession, search: Optional[str] = None):
    svc = _svc()
    items = await svc.list_medications(db, search)
    full = has_permission(getattr(current_user, "role", ""), "medication:read:full")
    if full:
        data = [MedicationFullResponse.model_validate(m).model_dump() for m in items]
    else:
        data = [MedicationBriefResponse.model_validate(m).model_dump() for m in items]
    return {"data": {"items": data, "total": len(data)}, "request_id": getattr(request.state, "request_id", "")}


@medications_router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
                         dependencies=[Depends(require_permission("medication:read:full"))])
async def create_medication(body: MedicationCreate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.create_medication(db, body.model_dump())
    data = MedicationFullResponse.model_validate(row).model_dump()
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}


@medications_router.get("/{medication_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def get_medication(medication_id: str, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.get_medication(db, medication_id)
    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Medication not found")
    full = has_permission(getattr(current_user, "role", ""), "medication:read:full")
    if full:
        data = MedicationFullResponse.model_validate(row).model_dump()
    else:
        data = MedicationBriefResponse.model_validate(row).model_dump()
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}


@medications_router.put("/{medication_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                        dependencies=[Depends(require_permission("medication:read:full"))])
async def update_medication(medication_id: str, body: MedicationUpdate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.update_medication(db, medication_id, body.model_dump(exclude_unset=True))
    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Medication not found")
    data = MedicationFullResponse.model_validate(row).model_dump()
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}


@medications_router.delete("/{medication_id}", status_code=status.HTTP_204_NO_CONTENT,
                           dependencies=[Depends(require_permission("medication:read:full"))])
async def delete_medication(medication_id: str, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    ok = await svc.delete_medication(db, medication_id)
    if not ok:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Medication not found")
    return None

@prescriptions_router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                          dependencies=[Depends(require_permission("prescription:read"))])
async def list_prescriptions(request: Request, current_user: CurrentUser, db: DbSession, patient_id: Optional[str] = None):
    svc = _svc()
    items = await svc.list_prescriptions(db, current_user, patient_id)
    data = []
    for p in items:
        med = await svc.get_medication(db, str(p.medication_id))
        from app.schemas.medication import PrescriptionResponse
        resp = PrescriptionResponse.model_validate(p)
        resp.medication_name = med.name if med else None
        data.append(resp.model_dump())
    return {"data": {"items": data, "total": len(data)}, "request_id": getattr(request.state, "request_id", "")}


@prescriptions_router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
                           dependencies=[Depends(require_permission("prescription:write"))])
async def create_prescription(body: PrescriptionCreate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.create_prescription(db, current_user, body.model_dump())
    med = await svc.get_medication(db, str(row.medication_id))
    from app.schemas.medication import PrescriptionResponse
    resp = PrescriptionResponse.model_validate(row)
    resp.medication_name = med.name if med else None
    return {"data": resp.model_dump(), "request_id": getattr(request.state, "request_id", "")}


@prescriptions_router.get("/{prescription_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                          dependencies=[Depends(require_permission("prescription:read"))])
async def get_prescription(prescription_id: str, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.get_prescription(db, current_user, prescription_id)
    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Prescription not found")
    med = await svc.get_medication(db, str(row.medication_id))
    from app.schemas.medication import PrescriptionResponse
    resp = PrescriptionResponse.model_validate(row)
    resp.medication_name = med.name if med else None
    return {"data": resp.model_dump(), "request_id": getattr(request.state, "request_id", "")}


@prescriptions_router.put("/{prescription_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                          dependencies=[Depends(require_permission("prescription:write"))])
async def update_prescription(prescription_id: str, body: PrescriptionUpdate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.update_prescription(db, current_user, prescription_id, body.model_dump(exclude_unset=True))
    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Prescription not found")
    med = await svc.get_medication(db, str(row.medication_id))
    from app.schemas.medication import PrescriptionResponse
    resp = PrescriptionResponse.model_validate(row)
    resp.medication_name = med.name if med else None
    return {"data": resp.model_dump(), "request_id": getattr(request.state, "request_id", "")}


@prescriptions_router.post("/{prescription_id}/deactivate", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                           dependencies=[Depends(require_permission("prescription:write"))])
async def deactivate_prescription(prescription_id: str, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.deactivate_prescription(db, current_user, prescription_id)
    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Prescription not found")
    med = await svc.get_medication(db, str(row.medication_id))
    from app.schemas.medication import PrescriptionResponse
    resp = PrescriptionResponse.model_validate(row)
    resp.medication_name = med.name if med else None
    return {"data": resp.model_dump(), "request_id": getattr(request.state, "request_id", "")}


@prescriptions_router.get("/{prescription_id}/adherence-rate", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                          dependencies=[Depends(require_permission("prescription:read"))])
async def adherence_rate(prescription_id: str, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    rate = await svc.adherence_rate(db, current_user, prescription_id)
    return {"data": {"prescription_id": prescription_id, "adherence": rate}, "request_id": getattr(request.state, "request_id", "")}


@adherence_router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
                       dependencies=[Depends(require_permission("prescription:read"))])
async def create_adherence(body: AdherenceCreate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    row = await svc.create_adherence(db, current_user, body.model_dump())
    from app.schemas.medication import AdherenceResponse
    return {"data": AdherenceResponse.model_validate(row).model_dump(), "request_id": getattr(request.state, "request_id", "")}


@adherence_router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                      dependencies=[Depends(require_permission("prescription:read"))])
async def list_adherence(request: Request, current_user: CurrentUser, db: DbSession, prescription_id: str):
    svc = _svc()
    items = await svc.list_adherence(db, current_user, prescription_id)
    from app.schemas.medication import AdherenceResponse
    data = [AdherenceResponse.model_validate(a).model_dump() for a in items]
    return {"data": {"items": data, "total": len(data)}, "request_id": getattr(request.state, "request_id", "")}

from fastapi import status


@adherence_router.patch("/{adherence_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
                        dependencies=[Depends(require_permission("prescription:write"))])
async def update_adherence(adherence_id: str, body: AdherenceUpdate, request: Request, current_user: CurrentUser, db: DbSession):
    svc = _svc()
    old = await svc.repo.get_adherence(db, adherence_id)
    row = await svc.update_adherence(db, adherence_id, body.model_dump(exclude_unset=True), corrected_by=str(current_user.id))
    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Adherence not found")
    from app.schemas.medication import AdherenceResponse
    from app.services import audit_service as audit_svc
    import uuid
    await audit_svc.record(db, user_id=current_user.id, action="medication_adherence.update", entity_type="medication_adherence", entity_id=uuid.UUID(str(row.id)), old_values={"is_taken": getattr(old, "is_taken", None), "note": getattr(old, "note", None)} if old else None, new_values=body.model_dump(exclude_unset=True), commit=True)
    return {"data": AdherenceResponse.model_validate(row).model_dump(), "request_id": getattr(request.state, "request_id", "")}


