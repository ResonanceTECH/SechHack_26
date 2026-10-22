"""Общие OpenAPI-схемы ответов."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class EnvelopeResponse(BaseModel):
    """Стандартный конверт ответа API."""

    data: Any = Field(default=None, description="Полезная нагрузка ответа")
    meta: dict[str, Any] = Field(
        default_factory=dict, description="Метаданные запроса (request_id, timestamp)"
    )
    error: dict[str, Any] | None = Field(default=None, description="Ошибка, если есть")
