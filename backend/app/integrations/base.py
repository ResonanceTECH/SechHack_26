"""Base contracts for universal API connector (MIS / emergency services)."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any
from uuid import UUID


@dataclass
class IntegrationResult:
    ok: bool
    status_code: int | None = None
    payload: dict[str, Any] | None = None
    error: str | None = None


class IntegrationAdapter(ABC):
    """Common interface for all external system adapters."""

    system_code: str

    @abstractmethod
    async def pull_patient(self, external_id: str) -> IntegrationResult:
        ...

    @abstractmethod
    async def push_screening_result(self, patient_external_id: str, payload: dict[str, Any]) -> IntegrationResult:
        ...

    @abstractmethod
    async def push_alert(self, patient_external_id: str, payload: dict[str, Any]) -> IntegrationResult:
        ...

    @abstractmethod
    async def health_check(self) -> IntegrationResult:
        ...