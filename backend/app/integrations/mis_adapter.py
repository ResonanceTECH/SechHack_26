"""Generic MIS adapter with real HTTP calls."""
from __future__ import annotations

import httpx

from app.integrations.base import IntegrationAdapter, IntegrationResult


class MISAdapter(IntegrationAdapter):
    system_code = "mis"

    def __init__(self, base_url: str, token: str | None = None, timeout: float = 10.0):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.timeout = timeout

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def pull_patient(self, external_id: str) -> IntegrationResult:
        if not self.base_url:
            return IntegrationResult(ok=False, error="MIS_BASE_URL not configured")
        url = f"{self.base_url}/patients/{external_id}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                r = await client.get(url, headers=self._headers())
            return IntegrationResult(ok=r.is_success, status_code=r.status_code, payload=r.json() if r.content else None, error=None if r.is_success else r.text)
        except Exception as exc:  # noqa: BLE001
            return IntegrationResult(ok=False, error=str(exc))

    async def push_screening_result(self, patient_external_id: str, payload: dict) -> IntegrationResult:
        if not self.base_url:
            return IntegrationResult(ok=False, error="MIS_BASE_URL not configured")
        url = f"{self.base_url}/patients/{patient_external_id}/screenings"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                r = await client.post(url, json=payload, headers=self._headers())
            return IntegrationResult(ok=r.is_success, status_code=r.status_code, payload=r.json() if r.content else None, error=None if r.is_success else r.text)
        except Exception as exc:  # noqa: BLE001
            return IntegrationResult(ok=False, error=str(exc))

    async def push_alert(self, patient_external_id: str, payload: dict) -> IntegrationResult:
        if not self.base_url:
            return IntegrationResult(ok=False, error="MIS_BASE_URL not configured")
        url = f"{self.base_url}/patients/{patient_external_id}/alerts"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                r = await client.post(url, json=payload, headers=self._headers())
            return IntegrationResult(ok=r.is_success, status_code=r.status_code, payload=r.json() if r.content else None, error=None if r.is_success else r.text)
        except Exception as exc:  # noqa: BLE001
            return IntegrationResult(ok=False, error=str(exc))

    async def health_check(self) -> IntegrationResult:
        if not self.base_url:
            return IntegrationResult(ok=False, error="MIS_BASE_URL not configured")
        url = f"{self.base_url}/health"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                r = await client.get(url, headers=self._headers())
            return IntegrationResult(ok=r.is_success, status_code=r.status_code, payload=r.json() if r.content else None, error=None if r.is_success else r.text)
        except Exception as exc:  # noqa: BLE001
            return IntegrationResult(ok=False, error=str(exc))
