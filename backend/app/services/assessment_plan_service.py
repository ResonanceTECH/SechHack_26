"""Assessment plan service for Measurement Based Care."""

from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import forbidden, not_found, validation_error
from app.core.questionnaire_registry import get_definition
from app.models.profile import PatientProfile, PractitionerProfile
from app.models.diagnosis import PatientDiagnosis
from app.repositories.assessment_plan_repository import AssessmentPlanRepository
from app.services import audit_service
import datetime as _dt


class AssessmentPlanService:
    def __init__(self, repository: AssessmentPlanRepository | None = None):
        self.repository = repository or AssessmentPlanRepository()

    def _next_due_date(self, row) -> Optional[str]:
        if not row.enabled:
            return None
        today = date.today()
        start = row.start_date or (row.created_at.date() if getattr(row, "created_at", None) else today)
        if row.end_date and today > row.end_date:
            return None
        if start > today:
            candidate = start
        else:
            delta = (today - start).days
            steps = delta // row.interval_days
            if start + _dt.timedelta(days=steps * row.interval_days) < today:
                steps += 1
            candidate = start + _dt.timedelta(days=steps * row.interval_days)
        if row.end_date and candidate > row.end_date:
            return None
        return candidate.isoformat()

    def _to_response(self, row) -> dict:
        return {
            "id": str(row.id),
            "patient_id": str(row.patient_id),
            "diagnosis_id": str(row.diagnosis_id) if row.diagnosis_id else None,
            "questionnaire_code": row.questionnaire_code,
            "interval_days": row.interval_days,
            "enabled": row.enabled,
            "start_date": row.start_date.isoformat() if row.start_date else None,
            "end_date": row.end_date.isoformat() if row.end_date else None,
            "created_by": str(row.created_by) if row.created_by else None,
            "created_at": row.created_at.isoformat() if getattr(row, "created_at", None) else None,
            "updated_at": row.updated_at.isoformat() if getattr(row, "updated_at", None) else None,
            "next_due_date": self._next_due_date(row),
        }

    async def _patient_profile_id(self, db: AsyncSession, user) -> Optional[str]:
        if getattr(user, "role", None) != "patient":
            return None
        profile = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))).scalars().first()
        return str(profile.id) if profile else None

    async def _practitioner_clinic_ids(self, db, user) -> list[str]:
        from app.services.clinic_isolation import practitioner_clinic_ids
        return await practitioner_clinic_ids(db, user)

    async def _get_patient_profile(self, db: AsyncSession, patient_id) -> Optional[PatientProfile]:
        try:
            pid = uuid.UUID(str(patient_id))
        except (ValueError, AttributeError):
            return None
        return (await db.execute(select(PatientProfile).where(PatientProfile.id == pid))).scalars().first()

    async def _patient_clinic_id(self, db, patient_id) -> Optional[str]:
        profile = await self._get_patient_profile(db, patient_id)
        return str(profile.clinic_id) if profile and profile.clinic_id else None

    def _validate_questionnaire(self, code: str) -> None:
        if get_definition(code) is None:
            raise validation_error("Неизвестный опросник")

    async def _validate_diagnosis(self, db: AsyncSession, patient_id: str, diagnosis_id: Optional[str]) -> None:
        if not diagnosis_id:
            return
        try:
            did = uuid.UUID(str(diagnosis_id))
            pid = uuid.UUID(str(patient_id))
        except ValueError:
            raise not_found("Диагноз не найден")
        row = (await db.execute(select(PatientDiagnosis).where(PatientDiagnosis.id == did))).scalar_one_or_none()
        if row is None or row.patient_id != pid:
            raise not_found("Диагноз не найден")

    async def create_plan(self, db: AsyncSession, current_user, data: Dict[str, Any]) -> dict:
        role = getattr(current_user, "role", None)
        if role not in ("doctor", "super_admin"):
            raise forbidden()
        payload = dict(data)
        patient_id = payload["patient_id"]
        patient_profile = await self._get_patient_profile(db, patient_id)
        if patient_profile is None:
            raise not_found("Пациент не найден")
        if role != "super_admin":
            p_clinics = await self._practitioner_clinic_ids(db, current_user)
            pat_clinic = str(patient_profile.clinic_id) if patient_profile.clinic_id else None
            if p_clinics and pat_clinic is not None and pat_clinic not in p_clinics:
                raise forbidden()
        self._validate_questionnaire(payload["questionnaire_code"])
        await self._validate_diagnosis(db, patient_id, payload.get("diagnosis_id"))
        payload["created_by"] = str(current_user.id)
        row = await self.repository.create(db, payload)
        await audit_service.record(
            db, user_id=current_user.id, action="assessment_plan.create",
            entity_type="AssessmentPlan", entity_id=row.id, new_values=payload, commit=True,
        )
        return self._to_response(row)

    async def get_plan(self, db: AsyncSession, plan_id: str, current_user) -> dict:
        row = await self.repository.get_by_id(db, plan_id)
        if row is None:
            raise not_found("План оценки не найден")
        role = getattr(current_user, "role", None)
        if role == "patient":
            own = await self._patient_profile_id(db, current_user)
            if own != str(row.patient_id):
                raise forbidden()
        elif role != "super_admin":
            patient_profile = await self._get_patient_profile(db, row.patient_id)
            if patient_profile is None:
                raise not_found("Пациент не найден")
            p_clinics = await self._practitioner_clinic_ids(db, current_user)
            pat_clinic = str(patient_profile.clinic_id) if patient_profile.clinic_id else None
            if p_clinics and pat_clinic is not None and pat_clinic not in p_clinics:
                raise forbidden()
        return self._to_response(row)

    async def update_plan(self, db: AsyncSession, plan_id: str, data: Dict[str, Any], current_user) -> dict:
        role = getattr(current_user, "role", None)
        if role not in ("doctor", "super_admin"):
            raise forbidden()
        row = await self.repository.get_by_id(db, plan_id)
        if row is None:
            raise not_found("План оценки не найден")
        if role != "super_admin":
            patient_profile = await self._get_patient_profile(db, row.patient_id)
            if patient_profile is None:
                raise not_found("Пациент не найден")
            p_clinics = await self._practitioner_clinic_ids(db, current_user)
            pat_clinic = str(patient_profile.clinic_id) if patient_profile.clinic_id else None
            if p_clinics and pat_clinic is not None and pat_clinic not in p_clinics:
                raise forbidden()
        payload = dict(data)
        if "questionnaire_code" in payload and payload["questionnaire_code"] is not None:
            self._validate_questionnaire(payload["questionnaire_code"])
        if "diagnosis_id" in payload:
            await self._validate_diagnosis(db, str(row.patient_id), payload.get("diagnosis_id"))
        old = {"questionnaire_code": row.questionnaire_code, "interval_days": row.interval_days, "enabled": row.enabled}
        updated = await self.repository.update(db, plan_id, payload)
        await audit_service.record(
            db, user_id=current_user.id, action="assessment_plan.update",
            entity_type="AssessmentPlan", entity_id=updated.id, old_values=old, new_values=payload, commit=True,
        )
        return self._to_response(updated)

    async def disable_plan(self, db: AsyncSession, plan_id: str, current_user) -> dict:
        return await self.update_plan(db, plan_id, {"enabled": False}, current_user)

    async def delete_plan(self, db: AsyncSession, plan_id: str, current_user) -> None:
        role = getattr(current_user, "role", None)
        if role not in ("doctor", "super_admin"):
            raise forbidden()
        row = await self.repository.get_by_id(db, plan_id)
        if row is None:
            raise not_found("План оценки не найден")
        if role != "super_admin":
            patient_profile = await self._get_patient_profile(db, row.patient_id)
            if patient_profile is None:
                raise not_found("Пациент не найден")
            p_clinics = await self._practitioner_clinic_ids(db, current_user)
            pat_clinic = str(patient_profile.clinic_id) if patient_profile.clinic_id else None
            if p_clinics and pat_clinic is not None and pat_clinic not in p_clinics:
                raise forbidden()
        old = {"id": str(row.id), "patient_id": str(row.patient_id), "questionnaire_code": row.questionnaire_code}
        await self.repository.delete(db, plan_id)
        await audit_service.record(
            db, user_id=current_user.id, action="assessment_plan.delete",
            entity_type="AssessmentPlan", entity_id=row.id, old_values=old, commit=True,
        )

    async def list_plans(self, db: AsyncSession, current_user, patient_id: Optional[str] = None) -> dict:
        role = getattr(current_user, "role", None)
        if role == "patient":
            own = await self._patient_profile_id(db, current_user)
            if own is None:
                return {"items": [], "total": 0}
            if patient_id and patient_id != own:
                raise forbidden()
            patient_id = own
        clinic_ids = None
        if role not in ("patient", "super_admin"):
            if patient_id:
                patient_profile = await self._get_patient_profile(db, patient_id)
                if patient_profile is None:
                    raise not_found("Пациент не найден")
                p_clinics = await self._practitioner_clinic_ids(db, current_user)
                pat_clinic = str(patient_profile.clinic_id) if patient_profile.clinic_id else None
                if p_clinics and pat_clinic is not None and pat_clinic not in p_clinics:
                    raise forbidden()
            else:
                clinic_ids = await self._practitioner_clinic_ids(db, current_user)
                if not clinic_ids:
                    return {"items": [], "total": 0}
        if patient_id:
            rows = await self.repository.list_by_patient(db, patient_id)
        else:
            rows = await self.repository.list_all(db, clinic_ids)
        return {"items": [self._to_response(r) for r in rows], "total": len(rows)}

    async def list_patient_plans(self, db: AsyncSession, patient_id: str, current_user) -> dict:
        return await self.list_plans(db, current_user, patient_id)

    async def patient_summary_assessment(self, db: AsyncSession, patient_id: str) -> dict:
        rows = await self.repository.list_by_patient(db, patient_id)
        active = [r for r in rows if r.enabled]
        today = date.today()
        overdue = []
        next_due = None
        for r in active:
            nd = self._next_due_date(r)
            if nd is None:
                continue
            d = date.fromisoformat(nd)
            if d < today:
                overdue.append({"plan_id": str(r.id), "questionnaire_code": r.questionnaire_code, "due_date": nd})
            if next_due is None or d < date.fromisoformat(next_due):
                next_due = nd
        return {
            "active_plans": len(active),
            "next_due_questionnaire": next_due,
            "overdue": overdue,
            "plans": [self._to_response(r) for r in active],
        }
