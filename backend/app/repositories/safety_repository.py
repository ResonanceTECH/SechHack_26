from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.safety import SafetyPlan, CrisisSignal


class SafetyPlanRepository:
    async def get_by_id(self, db: AsyncSession, plan_id: str):
        try:
            pid = uuid.UUID(str(plan_id))
        except ValueError:
            return None
        return (await db.execute(select(SafetyPlan).where(SafetyPlan.id == pid))).scalars().first()

    async def list_by_patient(self, db: AsyncSession, patient_id: str):
        try:
            pid = uuid.UUID(str(patient_id))
        except ValueError:
            return []
        result = await db.execute(select(SafetyPlan).where(SafetyPlan.patient_id == pid).order_by(SafetyPlan.created_at.desc()))
        return list(result.scalars().all())

    async def list_all(self, db: AsyncSession, clinic_patient_ids=None):
        stmt = select(SafetyPlan)
        if clinic_patient_ids is not None:
            if not clinic_patient_ids:
                return []
            stmt = stmt.where(SafetyPlan.patient_id.in_([uuid.UUID(str(x)) for x in clinic_patient_ids]))
        result = await db.execute(stmt.order_by(SafetyPlan.created_at.desc()))
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, data: dict):
        row = SafetyPlan(**data)
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def update(self, db: AsyncSession, plan_id: str, data: dict):
        row = await self.get_by_id(db, plan_id)
        if row is None:
            return None
        for k, v in data.items():
            setattr(row, k, v)
        await db.commit()
        await db.refresh(row)
        return row

    async def delete(self, db: AsyncSession, plan_id: str):
        row = await self.get_by_id(db, plan_id)
        if row is None:
            return False
        await db.delete(row)
        await db.commit()
        return True


class CrisisSignalRepository:
    async def list_by_patient(self, db: AsyncSession, patient_id: str):
        try:
            pid = uuid.UUID(str(patient_id))
        except ValueError:
            return []
        result = await db.execute(select(CrisisSignal).where(CrisisSignal.patient_id == pid).order_by(CrisisSignal.created_at.desc()))
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, data: dict):
        row = CrisisSignal(**data)
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_by_id(self, db: AsyncSession, signal_id: str):
        try:
            sid = uuid.UUID(str(signal_id))
        except ValueError:
            return None
        return (await db.execute(select(CrisisSignal).where(CrisisSignal.id == sid))).scalars().first()

    async def update_status(self, db: AsyncSession, signal_id: str, status: str, acknowledged_by=None):
        row = await self.get_by_id(db, signal_id)
        if row is None:
            return None
        row.status = status
        if status == "acknowledged":
            from datetime import datetime, timezone
            row.acknowledged_at = datetime.now(timezone.utc)
            if acknowledged_by:
                row.acknowledged_by = uuid.UUID(str(acknowledged_by))
        await db.commit()
        await db.refresh(row)
        return row
