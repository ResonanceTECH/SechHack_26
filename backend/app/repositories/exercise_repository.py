"""Exercise repository."""
from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.care import CarePlan, ExerciseAssignment, ExerciseCompletion


class ExerciseRepository:
    # Care plans
    async def create_care_plan(self, db: AsyncSession, data: dict) -> CarePlan:
        row = CarePlan(
            patient_id=uuid.UUID(str(data["patient_id"])),
            practitioner_id=uuid.UUID(str(data["practitioner_id"])),
            title=data["title"],
            description=data.get("description"),
            status=data.get("status", "active"),
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_care_plan(self, db: AsyncSession, care_plan_id: str) -> CarePlan | None:
        try:
            cid = uuid.UUID(str(care_plan_id))
        except ValueError:
            return None
        return (await db.execute(select(CarePlan).where(CarePlan.id == cid))).scalar_one_or_none()

    async def list_care_plans(self, db: AsyncSession, patient_id: str | None = None) -> list[CarePlan]:
        q = select(CarePlan)
        if patient_id:
            try:
                pid = uuid.UUID(str(patient_id))
            except ValueError:
                return []
            q = q.where(CarePlan.patient_id == pid)
        q = q.order_by(CarePlan.created_at.desc())
        return list((await db.execute(q)).scalars().all())

    # Assignments
    async def create_assignment(self, db: AsyncSession, data: dict) -> ExerciseAssignment:
        row = ExerciseAssignment(
            care_plan_id=uuid.UUID(str(data["care_plan_id"])),
            exercise_type=data["exercise_type"],
            payload=data.get("payload"),
            scheduled_for=data.get("scheduled_for"),
            due_at=data.get("due_at"),
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_assignment(self, db: AsyncSession, assignment_id: str) -> ExerciseAssignment | None:
        try:
            aid = uuid.UUID(str(assignment_id))
        except ValueError:
            return None
        return (await db.execute(select(ExerciseAssignment).where(ExerciseAssignment.id == aid))).scalar_one_or_none()

    async def list_assignments(self, db: AsyncSession, patient_id: str | None = None, care_plan_id: str | None = None) -> list[ExerciseAssignment]:
        q = select(ExerciseAssignment)
        if care_plan_id:
            try:
                cid = uuid.UUID(str(care_plan_id))
            except ValueError:
                return []
            q = q.where(ExerciseAssignment.care_plan_id == cid)
        if patient_id:
            try:
                pid = uuid.UUID(str(patient_id))
            except ValueError:
                return []
            # join care_plans
            q = q.join(CarePlan, CarePlan.id == ExerciseAssignment.care_plan_id).where(CarePlan.patient_id == pid)
        q = q.order_by(ExerciseAssignment.created_at.desc())
        return list((await db.execute(q)).scalars().all())

    async def update_assignment(self, db: AsyncSession, assignment_id: str, data: dict) -> ExerciseAssignment | None:
        row = await self.get_assignment(db, assignment_id)
        if row is None:
            return None
        for key, value in data.items():
            if value is None:
                continue
            if hasattr(row, key):
                setattr(row, key, value)
        await db.commit()
        await db.refresh(row)
        return row

    # Completions
    async def create_completion(self, db: AsyncSession, data: dict) -> ExerciseCompletion:
        row = ExerciseCompletion(
            assignment_id=uuid.UUID(str(data["assignment_id"])),
            patient_id=uuid.UUID(str(data["patient_id"])),
            result=data.get("result"),
            completed=bool(data.get("completed", True)),
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def list_completions(self, db: AsyncSession, assignment_id: str) -> list[ExerciseCompletion]:
        try:
            aid = uuid.UUID(str(assignment_id))
        except ValueError:
            return []
        q = select(ExerciseCompletion).where(ExerciseCompletion.assignment_id == aid).order_by(ExerciseCompletion.created_at.desc())
        return list((await db.execute(q)).scalars().all())

    async def compliance(self, db: AsyncSession, assignment_id: str) -> dict:
        items = await self.list_completions(db, assignment_id)
        last = items[0].created_at if items else None
        return {
            "assignment_id": assignment_id,
            "completions": len(items),
            "completed": len(items) > 0,
            "last_completed_at": last,
        }
