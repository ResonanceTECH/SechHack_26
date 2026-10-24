"""Assignment service."""
from __future__ import annotations

from app.repositories.assignment_repository import AssignmentRepository


class AssignmentService:
    def __init__(self, repo: AssignmentRepository | None = None):
        self.repo = repo or AssignmentRepository()

    async def create(self, db, data: dict):
        return await self.repo.create(db, data)

    async def list(self, db, patient_id=None, practitioner_id=None):
        return await self.repo.list(db, patient_id, practitioner_id)

    async def deactivate(self, db, assignment_id: str):
        return await self.repo.deactivate(db, assignment_id)
