"""Message schemas."""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class MessageCreate(BaseModel):
    recipient_id: str
    patient_id: Optional[str] = None
    body: str = Field(min_length=1)


class MessageResponse(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    patient_id: Optional[str] = None
    body: str
    is_read: bool
    created_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

    @field_validator("id", "sender_id", "recipient_id", "patient_id", mode="before")
    @classmethod
    def _id_to_str(cls, v):
        return str(v) if v is not None else v

    model_config = {"from_attributes": True}


class MessageListResponse(BaseModel):
    items: List[MessageResponse]
    total: int