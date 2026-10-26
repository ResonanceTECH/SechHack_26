from __future__ import annotations

import uuid
from datetime import date
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import forbidden, not_found, validation_error
from app.models.profile import PatientProfile, PractitionerProfile
from app.repositories.safety_repository import SafetyPlanRepository, CrisisSignalRepository
from app.services import audit_service


class SafetyPlanService:
    def __init__(self):
        self.repo = SafetyPlanRepository()
        self.crisis_repo = CrisisSignalRepository()

    def _to_plan(self, row) -> dict:
        return {
            "id": str(row.id),
            "patient_id": str(row.patient_id),
            "practitioner_id": str(row.practitioner_id),
            "title": row.title,
            "warning_signs": row.warning_signs,
            "internal_coping_strategies": row.internal_coping_strategies,
            "social_contacts": row.social_contacts,
            "family_support": row.family_support,
            "professional_contacts": row.professional_contacts,
            "emergency_contacts": row.emergency_contacts,
            "safe_environment": row.safe_environment,
            "is_active": row.is_active,
            "review_date": row.review_date.isoformat() if row.review_date else None,
            "created_at": row.created_at.isoformat() if getattr(row, "created_at", None) else None,
            "updated_at": row.updated_at.isoformat() if getattr(row, "updated_at", None) else None,
        }

    def _to_signal(self, row) -> dict:
        return {
            "id": str(row.id),
            "patient_id": str(row.patient_id),
            "type": row.type,
            "source": row.source,
            "message": row.message,
            "location": row.location,
            "status": row.status,
            "priority": row.priority,
            "created_at": row.created_at.isoformat() if getattr(row, "created_at", None) else None,
            "acknowledged_at": row.acknowledged_at.isoformat() if getattr(row, "acknowledged_at", None) else None,
            "acknowledged_by": str(row.acknowledged_by) if row.acknowledged_by else None,
        }


    async def _patient_profile(self, db, patient_id):
        try:
            pid = uuid.UUID(str(patient_id))
        except (ValueError, AttributeError):
            return None
        return (await db.execute(select(PatientProfile).where(PatientProfile.id == pid))).scalars().first()

    async def _practitioner_profile(self, db, user):
        if getattr(user, "role", None) not in ("doctor", "psychologist", "coordinator", "clinic_admin", "super_admin"):
            return None
        return (await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == user.id))).scalars().first()

    async def _clinic_check(self, db, current_user, patient_id):
        role = getattr(current_user, "role", None)
        if role in ("patient", "super_admin"):
            if role == "patient":
                own = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))).scalars().first()
                if own is None or str(own.id) != str(patient_id):
                    raise forbidden()
            return
        prac = await self._practitioner_profile(db, current_user)
        p_clinic = str(prac.clinic_id) if prac and prac.clinic_id else None
        patient = await self._patient_profile(db, patient_id)
        pat_clinic = str(patient.clinic_id) if patient and patient.clinic_id else None
        if p_clinic is not None and pat_clinic is not None and p_clinic != pat_clinic:
            raise forbidden()


    async def create_plan(self, db, data, current_user):
        role = getattr(current_user, "role", None)
        if role not in ("doctor", "psychologist", "super_admin"):
            raise forbidden()
        patient_id = data["patient_id"]
        await self._clinic_check(db, current_user, patient_id)
        prac = await self._practitioner_profile(db, current_user)
        practitioner_id = data.get("practitioner_id") or (str(prac.id) if prac else None)
        if practitioner_id is None:
            raise validation_error("Требуется practitioner_id")
        row = await self.repo.create(db, {
            "patient_id": uuid.UUID(patient_id),
            "practitioner_id": uuid.UUID(practitioner_id),
            "title": data["title"],
            "warning_signs": data.get("warning_signs"),
            "internal_coping_strategies": data.get("internal_coping_strategies"),
            "social_contacts": data.get("social_contacts"),
            "family_support": data.get("family_support"),
            "professional_contacts": data.get("professional_contacts"),
            "emergency_contacts": data.get("emergency_contacts"),
            "safe_environment": data.get("safe_environment"),
            "is_active": data.get("is_active", True),
            "review_date": data.get("review_date"),
        })
        await audit_service.record(db, user_id=current_user.id, action="safety_plan.create", entity_type="SafetyPlan", entity_id=row.id, new_values={"patient_id": patient_id, "title": row.title}, commit=True)
        return self._to_plan(row)


    async def get_plan(self, db, plan_id, current_user):
        role = getattr(current_user, "role", None)
        if role not in ("doctor", "psychologist", "coordinator", "clinic_admin", "super_admin"):
            raise forbidden()
        row = await self.repo.get_by_id(db, plan_id)
        if row is None:
            raise not_found("План безопасности не найден")
        await self._clinic_check(db, current_user, str(row.patient_id))
        return self._to_plan(row)

    async def list_plans(self, db, current_user, patient_id=None):
        role = getattr(current_user, "role", None)
        if role == "patient":
            own = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))).scalars().first()
            if own is None:
                return {"items": [], "total": 0}
            patient_id = str(own.id)
        if patient_id:
            await self._clinic_check(db, current_user, patient_id)
            rows = await self.repo.list_by_patient(db, patient_id)
        else:
            rows = await self.repo.list_all(db, None)
        return {"items": [self._to_plan(r) for r in rows], "total": len(rows)}

    async def update_plan(self, db, plan_id, data, current_user):
        role = getattr(current_user, "role", None)
        if role not in ("doctor", "psychologist", "super_admin"):
            raise forbidden()
        row = await self.repo.get_by_id(db, plan_id)
        if row is None:
            raise not_found("План безопасности не найден")
        await self._clinic_check(db, current_user, str(row.patient_id))
        old_snapshot = self._to_plan(row)
        from app.services.version_service import EntityVersionService
        await EntityVersionService().record(
            db, entity_type="safety_plan", entity_id=str(row.id),
            changed_by=str(current_user.id), reason="update", is_addendum=False,
            snapshot=old_snapshot,
        )
        update_data = {k: v for k, v in data.items() if v is not None}
        if "review_date" in data:
            update_data["review_date"] = data["review_date"]
        row = await self.repo.update(db, plan_id, update_data)
        await audit_service.record(db, user_id=current_user.id, action="safety_plan.update", entity_type="SafetyPlan", entity_id=row.id, new_values=update_data, commit=True)  # type: ignore[union-attr]
        return self._to_plan(row)

    async def delete_plan(self, db, plan_id, current_user):
        role = getattr(current_user, "role", None)
        if role not in ("doctor", "super_admin"):
            raise forbidden()
        row = await self.repo.get_by_id(db, plan_id)
        if row is None:
            raise not_found("План безопасности не найден")
        await self._clinic_check(db, current_user, str(row.patient_id))
        await self.repo.delete(db, plan_id)
        await audit_service.record(db, user_id=current_user.id, action="safety_plan.delete", entity_type="SafetyPlan", entity_id=row.id, old_values={"id": str(row.id)}, commit=True)  # type: ignore[union-attr]


    async def create_signal(self, db, data, current_user):
        await self._clinic_check(db, current_user, data["patient_id"])
        row = await self.crisis_repo.create(db, {
            "patient_id": uuid.UUID(data["patient_id"]),
            "type": data["type"],
            "source": data["source"],
            "message": data.get("message"),
            "location": data.get("location"),
            "triggered_by_screening_id": uuid.UUID(data["triggered_by_screening_id"]) if data.get("triggered_by_screening_id") else None,
        })
        await audit_service.record(db, user_id=current_user.id, action="crisis_signal.create", entity_type="CrisisSignal", entity_id=row.id, new_values={"patient_id": data["patient_id"], "type": row.type}, commit=True)
        return self._to_signal(row)



        role = getattr(current_user, "role", None)
        if role == "patient":
            own = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))).scalars().first()
            if own is None:
                return {"items": [], "total": 0}
            patient_id = str(own.id)
        if patient_id:
            await self._clinic_check(db, current_user, patient_id)
            rows = await self.crisis_repo.list_by_patient(db, patient_id)
        else:
            rows = []
        return {"items": [self._to_signal(r) for r in rows], "total": len(rows)}

    async def list_signals(self, db, current_user, patient_id=None):
        role = getattr(current_user, "role", None)
        if role == "patient":
            own = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))).scalars().first()
            if own is None:
                return {"items": [], "total": 0}
            patient_id = str(own.id)
        if patient_id:
            await self._clinic_check(db, current_user, patient_id)
            rows = await self.crisis_repo.list_by_patient(db, patient_id)
        else:
            rows = []
        return {"items": [self._to_signal(r) for r in rows], "total": len(rows)}


        role = getattr(current_user, "role", None)
        if role not in ("doctor", "psychologist", "coordinator", "super_admin"):
            raise forbidden()
        row = await self.crisis_repo.get_by_id(db, signal_id)
        if row is None:
            raise not_found("Кризисный сигнал не найден")
        await self._clinic_check(db, current_user, str(row.patient_id))
        row = await self.crisis_repo.update_status(db, signal_id, "acknowledged", acknowledged_by=current_user.id)
        if row is None:
            raise not_found("Кризисный сигнал не найден")
        await audit_service.record(db, user_id=current_user.id, action="crisis_signal.acknowledge", entity_type="CrisisSignal", entity_id=row.id, commit=True)  # type: ignore
        return self._to_signal(row)

    async def acknowledge_signal(self, db, signal_id, current_user):
        role = getattr(current_user, "role", None)
        if role not in ("doctor", "psychologist", "coordinator", "super_admin"):
            raise forbidden()
        row = await self.crisis_repo.get_by_id(db, signal_id)
        if row is None:
            raise not_found("Кризисный сигнал не найден")
        await self._clinic_check(db, current_user, str(row.patient_id))
        row = await self.crisis_repo.update_status(db, signal_id, "acknowledged", acknowledged_by=current_user.id)
        await audit_service.record(db, user_id=current_user.id, action="crisis_signal.acknowledge", entity_type="CrisisSignal", entity_id=row.id, commit=True)  # type: ignore
        return self._to_signal(row)


        plans = await self.repo.list_by_patient(db, patient_id)
        active = [p for p in plans if p.is_active]
        signals = await self.crisis_repo.list_by_patient(db, patient_id)
        return {
            "active_safety_plans": len(active),
            "crisis_signals_count": len(signals),
            "latest_crisis_signal": self._to_signal(signals[0]) if signals else None,
        }


    async def patient_summary_safety(self, db, patient_id):
        plans = await self.repo.list_by_patient(db, patient_id)
        active = [p for p in plans if p.is_active]
        signals = await self.crisis_repo.list_by_patient(db, patient_id)
        return {
            "active_safety_plans": len(active),
            "crisis_signals_count": len(signals),
            "latest_crisis_signal": self._to_signal(signals[0]) if signals else None,
        }
