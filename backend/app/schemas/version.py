from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class VersionCreateRequest(BaseModel):
    entity_type: str = Field(..., min_length=1, max_length=50)
    entity_id: str
    reason: Optional[str] = None
    is_addendum: bool = False
    snapshot: dict[str, Any] = Field(default_factory=dict)


class VersionResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    version_number: int
    changed_by: Optional[str] = None
    changed_at: Optional[str] = None
    reason: Optional[str] = None
    is_addendum: bool = False
    snapshot: dict[str, Any] = Field(default_factory=dict)