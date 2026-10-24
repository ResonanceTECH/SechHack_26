"""Admin API: staff management."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.models.profile import PractitionerProfile
from app.models.user import User
from app.schemas.common import EnvelopeResponse
from app.services.audit_service import record


admin_router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


class RoleChangeRequest(BaseModel):
    role: str


@admin_router.get(
    "/staff",
    status_code=status.HTTP_200_OK,
    response_model=EnvelopeResponse,
    dependencies=[Depends(require_permission("employee:manage"))],
)
async def list_staff(request: Request, current_user: CurrentUser, db: DbSession):
    rows = (
        await db.execute(
            select(PractitionerProfile, User).join(User, PractitionerProfile.user_id == User.id)
        )
    ).all()
    data = []
    for prof, user in rows:
        data.append(
            {
                "id": str(prof.id),
                "user_id": str(user.id),
                "first_name": prof.first_name,
                "last_name": prof.last_name,
                "specialization": prof.specialization,
                "clinic_id": str(prof.clinic_id),
                "is_active": prof.is_active,
                "role": user.role,
            }
        )
    return {"data": data, "request_id": getattr(request.state, "request_id", "")}


@admin_router.patch(
    "/staff/{practitioner_id}/role",
    status_code=status.HTTP_200_OK,
    response_model=EnvelopeResponse,
    dependencies=[Depends(require_permission("employee:manage"))],
)
async def change_role(
    practitioner_id: str,
    body: RoleChangeRequest,
    request: Request,
    current_user: CurrentUser,
    db: DbSession,
):
    try:
        pid = uuid.UUID(str(practitioner_id))
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    prof = await db.get(PractitionerProfile, pid)
    if prof is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    user = await db.get(User, prof.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    old_role = user.role
    user.role = body.role
    await record(
        db,
        user_id=current_user.id,
        action="employee.role_change",
        entity_type="user",
        entity_id=user.id,
        old_values={"role": old_role},
        new_values={"role": body.role},
        commit=False,
    )
    await db.commit()
    return {"data": {"id": str(prof.id), "role": user.role}, "request_id": getattr(request.state, "request_id", "")}
