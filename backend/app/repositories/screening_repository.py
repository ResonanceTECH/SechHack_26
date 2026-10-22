from __future__ import annotations

import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.clinical import ScreeningResult


class ScreeningRepository:
    async def create_screening(self, db: AsyncSession, patient_id: str, questionnaire_type: str,
                               questionnaire_version: str, score: int, answers, is_critical: bool) -> ScreeningResult:
        row = ScreeningResult(
            patient_id=uuid.UUID(str(patient_id)),
            questionnaire_type=questionnaire_type,
            questionnaire_version=questionnaire_version,
            score=score,
            answers=answers,
            is_critical=is_critical,
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    async def get_by_id(self, db: AsyncSession, screening_id: str) -> ScreeningResult | None:
        try:
            sid = uuid.UUID(str(screening_id))
        except ValueError:
            return None
        return (await db.execute(select(ScreeningResult).where(ScreeningResult.id == sid))).scalar_one_or_none()

    async def get_patient_screenings(self, db: AsyncSession, patient_id: str) -> list[ScreeningResult]:
        try:
            pid = uuid.UUID(str(patient_id))
        except ValueError:
            return []
        stmt = select(ScreeningResult).where(ScreeningResult.patient_id == pid).order_by(ScreeningResult.created_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_latest_screening(self, db: AsyncSession, patient_id: str) -> ScreeningResult | None:
        items = await self.get_patient_screenings(db, patient_id)
        return items[0] if items else None
