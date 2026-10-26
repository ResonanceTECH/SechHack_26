"""QR invite endpoint."""
from __future__ import annotations

from fastapi import APIRouter, Request, status

from app.core.response import envelope
from app.schemas.common import EnvelopeResponse

router = APIRouter(prefix="/api/v1/qr", tags=["qr"])


def _rid(request: Request) -> str:
    return getattr(request.state, "request_id", "")


@router.get("/invite", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse)
async def get_invite_qr(code: str, request: Request) -> dict:
    """Return payload for client-side QR generation for an invite code."""
    return envelope(
        data={"code": code, "qr_text": code, "code_display": f"{code[:3]}-{code[3:]}"},
        request_id=_rid(request),
    )
