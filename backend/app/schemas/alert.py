from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class AlertUpdate(BaseModel):
    status: Literal["new", "in_progress", "resolved", "dismissed"] | None = None
    comment: str | None = None


class AlertResponse(BaseModel):
    id: str
    patient_id: str
    type: str
    priority: str
    status: str
    title: str
    summary: str | None = None
    created_at: str | None = None
    resolved_at: str | None = None
    resolved_by: str | None = None


class SafetyPlanResponse(BaseModel):
    alert_id: str
    steps: list[str] = Field(default_factory=list)
