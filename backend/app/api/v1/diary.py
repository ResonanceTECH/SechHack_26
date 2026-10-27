from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.core.errors import forbidden, not_found, validation_error
from app.models.profile import PatientProfile
from app.repositories.diary_repository import DiaryRepository
from app.schemas.common import EnvelopeResponse
from app.schemas.diary import (
    DiaryBulkSyncRequest,
    DiaryBulkSyncResponse,
    DiaryCreateRequest,
    DiaryEntryResponse,
    DiarySummaryResponse,
    DiaryUpdateRequest,
)

router = APIRouter(prefix="/api/v1/diary", tags=["diary"])


def _repo() -> DiaryRepository:
    return DiaryRepository()


def _to_response(row) -> DiaryEntryResponse:
    return DiaryEntryResponse(
        id=str(row.id),
        patient_id=str(row.patient_id),
        recorded_at=row.recorded_at.isoformat() if row.recorded_at else None,
        mood_score=row.mood_score,
        anxiety_score=row.anxiety_score,
        energy_score=row.energy_score,
        functioning_score=row.functioning_score,
        sleep_hours=row.sleep_hours,
        sleep_quality=row.sleep_quality,
        notes=row.notes,
        device_id=row.device_id,
        synced_at=row.synced_at.isoformat() if row.synced_at else None,
        created_at=row.created_at.isoformat() if row.created_at else None,
    )


async def _patient_id_for_user(current_user, db) -> Optional[str]:
    if current_user.role == "patient":
        from sqlalchemy import select
        prof = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))).scalar_one_or_none()
        return str(prof.id) if prof else None
    return None
@router.get("/today", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("diary:read"))])
async def today_checkin(request: Request, current_user: CurrentUser, db: DbSession,
                        patient_id: Optional[str] = Query(None)) -> dict:
    if current_user.role == "patient":
        pid = await _patient_id_for_user(current_user, db)
        if pid is None:
            raise not_found("Профиль пациента не найден")
    else:
        if not patient_id:
            raise validation_error("patient_id обязателен")
        pid = patient_id
        from app.services.clinic_isolation import practitioner_clinic_ids, patient_clinic_id, enforce_clinic_match
        p_clinics = await practitioner_clinic_ids(db, current_user)
        pat_clinic = await patient_clinic_id(db, pid)
        enforce_clinic_match(p_clinics, pat_clinic)
    from datetime import date, datetime, timezone
    today = datetime.now(timezone.utc).date()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = datetime.combine(today, datetime.max.time(), tzinfo=timezone.utc)
    rows = await _repo().list_for_patient(db, pid, start, end, limit=1)
    entry = _to_response(rows[0]) if rows else None
    return {"data": {"patient_id": pid, "date": today.isoformat(), "entry": entry, "completed": entry is not None}, "request_id": getattr(request.state, "request_id", "")}

@router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("diary:read"))])
async def list_diary(request: Request, current_user: CurrentUser, db: DbSession,
                     patient_id: Optional[str] = Query(None),
                     date_from: Optional[datetime] = Query(None),
                     date_to: Optional[datetime] = Query(None),
                      limit: Optional[int] = Query(None, ge=1, le=200),
                      offset: Optional[int] = Query(None, ge=0)) -> dict:

    if current_user.role == "patient":
        pid = await _patient_id_for_user(current_user, db)
        if pid is None:
            raise not_found("Профиль пациента не найден")
    else:
        if not patient_id:
            raise validation_error("patient_id обязателен")
        pid = patient_id
        from app.services.clinic_isolation import practitioner_clinic_ids, patient_clinic_id, enforce_clinic_match

        p_clinics = await practitioner_clinic_ids(db, current_user)
        pat_clinic = await patient_clinic_id(db, pid)
        enforce_clinic_match(p_clinics, pat_clinic)
    rows = await _repo().list_for_patient(db, pid, date_from, date_to, limit, offset)
    items = [_to_response(r) for r in rows]
    return {"data": {"items": items, "total": len(items)}, "request_id": getattr(request.state, "request_id", "")}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse,
             dependencies=[Depends(require_permission("diary:write"))])
async def create_diary(body: DiaryCreateRequest, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    pid = await _patient_id_for_user(current_user, db)
    if pid is None:
        raise not_found("Профиль пациента не найден")
    data = body.model_dump()
    data["recorded_at"] = body.recorded_at
    row = await _repo().create_entry(db, pid, data, synced=False)
    return {"data": _to_response(row), "request_id": getattr(request.state, "request_id", "")}


@router.put("/{entry_id}", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("diary:write"))])
async def update_diary(entry_id: str, body: DiaryUpdateRequest, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    row = await _repo().get_by_id(db, entry_id)
    if row is None:
        raise not_found("Запись не найдена")
    if current_user.role == "patient":
        pid = await _patient_id_for_user(current_user, db)
        if pid is None or str(row.patient_id) != pid:
            raise forbidden()
    data = body.model_dump(exclude_unset=True)
    snapshot = {
        "mood_score": row.mood_score, "anxiety_score": row.anxiety_score,
        "energy_score": row.energy_score, "functioning_score": row.functioning_score,
        "sleep_hours": row.sleep_hours, "sleep_quality": row.sleep_quality,
        "notes": row.notes, "recorded_at": row.recorded_at.isoformat() if row.recorded_at else None,
    }
    from app.services.version_service import EntityVersionService
    await EntityVersionService().record(
        db, entity_type="diary_entry", entity_id=str(row.id),
        changed_by=str(current_user.id), reason="update", is_addendum=False, snapshot=snapshot,
    )
    row = await _repo().update_entry(db, row, data)
    return {"data": _to_response(row), "request_id": getattr(request.state, "request_id", "")}


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_permission("diary:write"))])
async def delete_diary(entry_id: str, request: Request, current_user: CurrentUser, db: DbSession) -> None:
    row = await _repo().get_by_id(db, entry_id)
    if row is None:
        raise not_found("Запись не найдена")
    if current_user.role == "patient":
        pid = await _patient_id_for_user(current_user, db)
        if pid is None or str(row.patient_id) != pid:
            raise forbidden()
    await _repo().delete_entry(db, row)
    return None
@router.post("/bulk-sync", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
             dependencies=[Depends(require_permission("diary:write"))])
async def bulk_sync(body: DiaryBulkSyncRequest, request: Request, current_user: CurrentUser, db: DbSession) -> dict:
    pid = await _patient_id_for_user(current_user, db)
    if pid is None:
        raise not_found("Профиль пациента не найден")
    repo = _repo()
    created = 0
    skipped = 0
    items = []
    for entry in body.entries:
        if await repo.exists_duplicate(db, pid, body.device_id, entry.recorded_at):
            skipped += 1
            continue
        data = entry.model_dump()
        data["device_id"] = body.device_id
        data["recorded_at"] = entry.recorded_at
        row = await repo.create_entry(db, pid, data, synced=True)
        created += 1
        items.append(_to_response(row))
    result = DiaryBulkSyncResponse(created=created, skipped=skipped, items=items).model_dump()
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}


@router.get("/summary", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("diary:read"))])
async def diary_summary(request: Request, current_user: CurrentUser, db: DbSession,
                        patient_id: Optional[str] = Query(None),
                        date_from: Optional[datetime] = Query(None),
                        date_to: Optional[datetime] = Query(None),
                      limit: Optional[int] = Query(None, ge=1, le=200),
                      offset: Optional[int] = Query(None, ge=0)) -> dict:
    if current_user.role == "patient":
        pid = await _patient_id_for_user(current_user, db)
        if pid is None:
            raise not_found("Профиль пациента не найден")
    else:
        if not patient_id:
            raise validation_error("patient_id обязателен")
        pid = patient_id
        from app.services.clinic_isolation import practitioner_clinic_ids, patient_clinic_id, enforce_clinic_match

        p_clinics = await practitioner_clinic_ids(db, current_user)
        pat_clinic = await patient_clinic_id(db, pid)
        enforce_clinic_match(p_clinics, pat_clinic)
    rows = await _repo().list_for_patient(db, pid, date_from, date_to)
    def _avg(attr):
        vals = [getattr(r, attr) for r in rows if getattr(r, attr) is not None]
        return round(sum(vals) / len(vals), 2) if vals else None
    result = DiarySummaryResponse(
        patient_id=pid,
        from_date=date_from.isoformat() if date_from else None,
        to_date=date_to.isoformat() if date_to else None,
        total_entries=len(rows),
        avg_mood=_avg("mood_score"),
        avg_anxiety=_avg("anxiety_score"),
        avg_energy=_avg("energy_score"),
        avg_functioning=_avg("functioning_score"),
    ).model_dump()
    return {"data": result, "request_id": getattr(request.state, "request_id", "")}