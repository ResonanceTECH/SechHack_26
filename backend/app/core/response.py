"""Единый конверт ответа API: {"data", "meta": {"request_id", "timestamp"}, "error"}."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


def envelope(
    *,
    data: Any = None,
    request_id: str | None = None,
    error: dict[str, str] | None = None,
) -> dict[str, Any]:
    """Собрать конверт ответа по спецификации API_CONTRACTS.md §1."""
    return {
        "data": data,
        "meta": {"request_id": request_id or str(uuid.uuid4()), "timestamp": now_iso()},
        "error": error,
    }


def ok(data: Any, request_id: str | None = None) -> dict[str, Any]:
    return envelope(data=data, request_id=request_id)


def fail(
    code: str, message: str, request_id: str | None = None
) -> dict[str, Any]:  # noqa: E501
    return envelope(request_id=request_id, error={"code": code, "message": message})
