from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.care import Alert


class AlertRepository:
    async def create_alert(self, db: AsyncSession, data: dict) -> Alert:
        alert = Alert(
            patient_id=uuid.UUID(str(data["patient_id"])),
            type=data["type"],
            priority=data["priority"],
            status=data.get("status", "new"),
            title=data["title"],
            summary=data.get("summary"),
        )
        db.add(alert)
        await db.commit()
        await db.refresh(alert)
        return alert

    async def get_alert(self, db: AsyncSession, alert_id: str) -> Alert | None:
        try:
            aid = uuid.UUID(str(alert_id))
        except ValueError:
            return None
        return (await db.execute(select(Alert).where(Alert.id == aid))).scalar_one_or_none()

    async def list_alerts(self, db: AsyncSession, filters: dict | None = None, limit: int = 100, offset: int = 0, accessible_patient_ids=None) -> tuple[list[Alert], int]:
        from sqlalchemy import func
        stmt = select(Alert)
        if filters:
            if filters.get("patient_id"):
                stmt = stmt.where(Alert.patient_id == uuid.UUID(str(filters["patient_id"])))
            if filters.get("status"):
                stmt = stmt.where(Alert.status == filters["status"])
            if filters.get("priority"):
                stmt = stmt.where(Alert.priority == filters["priority"])
            if filters.get("type"):
                stmt = stmt.where(Alert.type == filters["type"])
        if accessible_patient_ids is not None:
            if not accessible_patient_ids:
                return [], 0
            stmt = stmt.where(Alert.patient_id.in_([uuid.UUID(str(x)) for x in accessible_patient_ids]))
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await db.execute(count_stmt)).scalar_one()
        stmt = stmt.order_by(Alert.created_at.desc()).offset(offset).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all()), int(total)

    async def resolve_alert(self, db: AsyncSession, alert_id: str, resolved_by: str | None = None, comment: str | None = None) -> Alert | None:
        alert = await self.get_alert(db, alert_id)
        if not alert:
            return None
        alert.status = "resolved"
        alert.resolved_at = datetime.now(timezone.utc)
        if resolved_by:
            alert.resolved_by = uuid.UUID(str(resolved_by))
        if comment:
            alert.summary = (alert.summary or "") + f"\n[resolve] {comment}" if alert.summary else f"[resolve] {comment}"
        await db.commit()
        await db.refresh(alert)
        return alert

    async def dismiss_alert(self, db: AsyncSession, alert_id: str, resolved_by: str | None = None, comment: str | None = None) -> Alert | None:
        alert = await self.get_alert(db, alert_id)
        if not alert:
            return None
        alert.status = "dismissed"
        alert.resolved_at = datetime.now(timezone.utc)
        if resolved_by:
            alert.resolved_by = uuid.UUID(str(resolved_by))
        if comment:
            alert.summary = (alert.summary or "") + f"\n[dismiss] {comment}" if alert.summary else f"[dismiss] {comment}"
        await db.commit()
        await db.refresh(alert)
        return alert

    async def find_duplicate_alerts(self, db: AsyncSession, patient_id: str, alert_type: str) -> list[Alert]:
        stmt = select(Alert).where(
            Alert.patient_id == uuid.UUID(str(patient_id)),
            Alert.type == alert_type,
            Alert.status.in_(["new", "in_progress"]),
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def update_status(self, db: AsyncSession, alert_id: str, status: str, resolved_by: str | None = None, comment: str | None = None) -> Alert | None:
        alert = await self.get_alert(db, alert_id)
        if not alert:
            return None
        alert.status = status
        if status in ("resolved", "dismissed"):
            alert.resolved_at = datetime.now(timezone.utc)
            if resolved_by:
                alert.resolved_by = uuid.UUID(str(resolved_by))
        if comment:
            alert.summary = (alert.summary or "") + f"\n[{status}] {comment}"
        await db.commit()
        await db.refresh(alert)
        return alert
