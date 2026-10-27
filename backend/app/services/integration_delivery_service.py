"""Delivery service for integration events."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.integrations.emergency_adapter import EmergencyServiceAdapter
from app.integrations.mis_adapter import MISAdapter
from app.models.integration import IntegrationEvent
from app.repositories.integration_repository import IntegrationRepository


class IntegrationDeliveryService:
    MAX_RETRIES = 5
    BACKOFF_MINUTES = [1, 5, 15, 60, 360]

    def _adapter_for(self, target_system: str):
        settings = get_settings()
        if target_system == "mis":
            return MISAdapter(settings.mis_base_url, settings.mis_api_token)
        if target_system == "emergency":
            return EmergencyServiceAdapter(settings.emergency_base_url, settings.emergency_api_token)
        return None

    async def deliver(self, db: AsyncSession, event: IntegrationEvent) -> IntegrationEvent:
        adapter = self._adapter_for(event.target_system)
        repo = IntegrationRepository()

        if adapter is None:
            event.status = "failed"
            event.response = {"error": f"unknown target system: {event.target_system}"}
            await db.commit()
            await db.refresh(event)
            return event

        # Determine delivery method by event type
        payload = event.payload or {}
        if event.event_type.startswith("screening"):
            result = await adapter.push_screening_result(str(event.entity_id) if event.entity_id else "unknown", payload)
        elif event.event_type.startswith("alert"):
            result = await adapter.push_alert(str(event.entity_id) if event.entity_id else "unknown", payload)
        else:
            result = await adapter.push_alert(str(event.entity_id) if event.entity_id else "unknown", payload)

        event.response = {"ok": result.ok, "status_code": result.status_code, "payload": result.payload, "error": result.error}
        if result.ok:
            event.status = "sent"
            event.next_retry_at = None
        else:
            event.retry_count += 1
            if event.retry_count >= self.MAX_RETRIES:
                event.status = "dead_letter"
                event.next_retry_at = None
            else:
                delay = self.BACKOFF_MINUTES[min(event.retry_count - 1, len(self.BACKOFF_MINUTES) - 1)]
                event.status = "failed"
                event.next_retry_at = datetime.now(timezone.utc) + timedelta(minutes=delay)
        await db.commit()
        await db.refresh(event)
        return event

    async def process_pending(self, db: AsyncSession, limit: int = 50) -> int:
        from sqlalchemy import select

        now = datetime.now(timezone.utc)
        rows = (await db.execute(
            select(IntegrationEvent).where(
                IntegrationEvent.status.in_(["pending", "failed"]),
                (IntegrationEvent.next_retry_at.is_(None)) | (IntegrationEvent.next_retry_at <= now),
            ).limit(limit)
        )).scalars().all()

        processed = 0
        for row in rows:
            await self.deliver(db, row)
            processed += 1
        return processed
