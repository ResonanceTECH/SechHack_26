"""User profile schemas."""

from __future__ import annotations

import uuid
from datetime import date

from pydantic import BaseModel, EmailStr, Field


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    phone: str | None = None
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    birth_date: str | None = None
    gender: str | None = None

    model_config = {"from_attributes": True}


class UserOut(BaseModel):
    id: str
    email: str | None = None
    phone: str | None = None
    role: str
    first_name: str | None = None
    last_name: str | None = None
    middle_name: str | None = None
    birth_date: str | None = None
    gender: str | None = None

    model_config = {"from_attributes": True}
