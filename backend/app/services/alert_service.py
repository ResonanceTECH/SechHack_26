from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import forbidden, not_found, validation_error, conflict
from app.core.permissions import has_permission
from app.models.profile import PatientProfile, PractitionerProfile
from app.models.assignment import PatientAssignment
from app.repositories.alert_repository import AlertRepository
from app.services import audit_service
from app.services.alert_rules.screening import screening_alert_rule


class AlertService:
    VALID_STATUSES = {"new", "in_progress", "resolved", "dismissed"}
    TRANSITIONS = {
        "new": {"in_progress", "resolved", "dismissed"},
        "in_progress": {"resolved", "dismissed"},
        "resolved": set(),
        "dismissed": set(),
    }

    def __init__(self, repository=None):
        self.repository = repository or AlertRepository()

    async def create_alert(self, db, data):
        existing = await self.repository.find_duplicate_alerts(db, data["patient_id"], data["type"])
        if existing:
            return self._to_dict(existing[0])
        alert = await self.repository.create_alert(db, data)
        try:
            await audit_service.record(
                db,
                user_id=None,
                action="alert.created",
                entity_type="Alert",
                entity_id=alert.id,
                new_values={"patient_id": str(alert.patient_id), "type": alert.type, "priority": alert.priority, "status": alert.status},
                commit=True,
            )
        except Exception:
            import logging
            logging.getLogger(__name__).exception('audit record failed')
        return self._to_dict(alert)

    async def generate_alerts_for_screening(self, db, screening):
        code = screening.get("questionnaire_code") or screening.get("questionnaire_type")
        answers_raw = screening.get("answers")
        answers = []
        if isinstance(answers_raw, list):
            if answers_raw and isinstance(answers_raw[0], dict):
                answers = [int(x.get("value", 0)) for x in answers_raw]
            else:
                answers = [int(x) for x in answers_raw]
        score = int(screening.get("score", 0))
        is_critical = bool(screening.get("is_critical", False))
        critical_reason = screening.get("critical_reason")
        result = screening_alert_rule(code, score, answers, is_critical, critical_reason)
        if not result.is_alert:
            return []
        data = {
            "patient_id": screening["patient_id"],
            "type": result.alert_type,
            "priority": result.priority,
            "title": f"Alert: {result.reason}",
            "summary": f"Screening {code} score={score} reason={result.reason}",
        }
        created = await self.create_alert(db, data)
        return [created]
    async def _accessible_patient_ids(self, db, current_user):
        if current_user.role == "patient":
            profile = (
                await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
            ).scalar_one_or_none()
            return {str(profile.id)} if profile else set()
        if current_user.role in ("doctor", "psychologist"):
            prac = (
                await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == current_user.id))
            ).scalar_one_or_none()
            if not prac:
                return set()
            rows = (
                await db.execute(
                    select(PatientAssignment.patient_id).where(PatientAssignment.practitioner_id == prac.id)
                )
            ).scalars().all()
            return {str(x) for x in rows}
        return None

    async def _ensure_access(self, db, current_user, alert):
        accessible = await self._accessible_patient_ids(db, current_user)
        if accessible is not None and str(alert.patient_id) not in accessible:
            raise forbidden()

    async def list_alerts(self, db, current_user, filters=None, limit: int = 100, offset: int = 0):
        filters = dict(filters or {})
        accessible = await self._accessible_patient_ids(db, current_user)
        if current_user.role == "patient":
            profile = (
                await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
            ).scalar_one_or_none()
            if profile:
                filters["patient_id"] = str(profile.id)
        alerts, total = await self.repository.list_alerts(db, filters, limit=limit, offset=offset, accessible_patient_ids=accessible)
        return [self._to_dict(a) for a in alerts], total

    async def get_alert(self, db, alert_id, current_user):
        alert = await self.repository.get_alert(db, alert_id)
        if not alert:
            raise not_found("Алерт не найден")
        await self._ensure_access(db, current_user, alert)
        return self._to_dict(alert)

    async def resolve_alert(self, db, alert_id, current_user, comment=None):
        if not has_permission(current_user.role, "alert:resolve"):
            raise forbidden()
        alert = await self.repository.get_alert(db, alert_id)
        if not alert:
            raise not_found("Алерт не найден")
        await self._ensure_access(db, current_user, alert)
        if alert.status == "resolved":
            return self._to_dict(alert)
        if "resolved" not in self.TRANSITIONS.get(alert.status, set()):
            raise conflict("Недопустимый переход статуса алерта")
        updated = await self.repository.resolve_alert(db, alert_id, str(current_user.id), comment)
        if not updated:
            raise not_found("Алерт не найден")
        try:
            await audit_service.record(
                db,
                user_id=uuid.UUID(str(current_user.id)),
                action="alert.resolve",
                entity_type="Alert",
                entity_id=updated.id,
                old_values={"status": alert.status},
                new_values={"status": "resolved", "comment": comment},
                commit=True,
            )
        except Exception:
            import logging
            logging.getLogger(__name__).exception('audit record failed')
        return self._to_dict(updated)

    async def dismiss_alert(self, db, alert_id, current_user, comment=None):
        if not has_permission(current_user.role, "alert:resolve"):
            raise forbidden()
        alert = await self.repository.get_alert(db, alert_id)
        if not alert:
            raise not_found("Алерт не найден")
        await self._ensure_access(db, current_user, alert)
        if alert.status == "dismissed":
            return self._to_dict(alert)
        if "dismissed" not in self.TRANSITIONS.get(alert.status, set()):
            raise conflict("Недопустимый переход статуса алерта")
        updated = await self.repository.dismiss_alert(db, alert_id, str(current_user.id), comment)
        if not updated:
            raise not_found("Алерт не найден")
        try:
            await audit_service.record(
                db,
                user_id=uuid.UUID(str(current_user.id)),
                action="alert.dismiss",
                entity_type="Alert",
                entity_id=updated.id,
                old_values={"status": alert.status},
                new_values={"status": "dismissed", "comment": comment},
                commit=True,
            )
        except Exception:
            import logging
            logging.getLogger(__name__).exception('audit record failed')
        return self._to_dict(updated)

    async def update_alert(self, db, alert_id, current_user, data):
        status = data.get("status")
        comment = data.get("comment")
        if status is not None and status not in self.VALID_STATUSES:
            raise validation_error("Недопустимый статус алерта")
        alert = await self.repository.get_alert(db, alert_id)
        if not alert:
            raise not_found("Алерт не найден")
        await self._ensure_access(db, current_user, alert)
        if status is None:
            return self._to_dict(alert)
        if status == alert.status:
            return self._to_dict(alert)
        if status not in self.TRANSITIONS.get(alert.status, set()):
            raise conflict("Недопустимый переход статуса алерта")
        if status == "resolved":
            return await self.resolve_alert(db, alert_id, current_user, comment)
        if status == "dismissed":
            return await self.dismiss_alert(db, alert_id, current_user, comment)
        if status == "in_progress":
            if not has_permission(current_user.role, "alert:resolve"):
                raise forbidden()
            updated = await self.repository.update_status(db, alert_id, status, str(current_user.id), comment)
            if not updated:
                raise not_found("Алерт не найден")
            try:
                await audit_service.record(
                    db,
                    user_id=uuid.UUID(str(current_user.id)),
                    action="alert.updated",
                    entity_type="Alert",
                    entity_id=updated.id,
                    old_values={"status": alert.status},
                    new_values={"status": status, "comment": comment},
                    commit=True,
                )
            except Exception:
                pass
            return self._to_dict(updated)
        return self._to_dict(alert)

    async def get_safety_plan(self, db, alert_id, current_user):
        alert = await self.repository.get_alert(db, alert_id)
        if not alert:
            raise not_found("Алерт не найден")
        await self._ensure_access(db, current_user, alert)
        steps = [
            "Оценить непосредственный риск суицида/самоповреждения.",
            "Обеспечить безопасность пациента (убрать средства).",
            "Связаться с пациентом и близкими.",
            "Назначить срочную консультацию специалиста.",
            "Зафиксировать план и последующие шаги.",
        ]
        return {"alert_id": str(alert.id), "steps": steps}

    def _to_dict(self, alert):
        return {
            "id": str(alert.id),
            "patient_id": str(alert.patient_id),
            "type": alert.type,
            "priority": alert.priority,
            "status": alert.status,
            "title": alert.title,
            "summary": alert.summary,
            "created_at": alert.created_at.isoformat() if getattr(alert, "created_at", None) else None,
            "resolved_at": alert.resolved_at.isoformat() if getattr(alert, "resolved_at", None) else None,
            "resolved_by": str(alert.resolved_by) if getattr(alert, "resolved_by", None) else None,
        }
