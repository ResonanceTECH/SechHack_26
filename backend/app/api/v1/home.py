"""Home dashboard aggregation endpoint."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Request, status
from sqlalchemy import select

from app.api.dependencies import CurrentUser, DbSession
from app.models.profile import PatientProfile, PractitionerProfile
from app.repositories.alert_repository import AlertRepository
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.patient_repository import PatientRepository
from app.schemas.common import EnvelopeResponse
from app.services.patient_service import PatientService


router = APIRouter(prefix="/api/v1/home", tags=["home"])


def _rid(request: Request) -> str:
    return getattr(request.state, "request_id", "")


@router.get(
    "/dashboard",
    status_code=status.HTTP_200_OK,
    response_model=EnvelopeResponse,
    responses={401: {"description": "Ne avtorizovan"}},
)
async def get_home_dashboard(current_user: CurrentUser, db: DbSession, request: Request) -> dict:
    """Aggregirovannoe predstavlenie domashnego ekrana (vrach/pacient)."""
    if current_user.role == "patient":
        profile = (
            await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        ).scalar_one_or_none()
        if profile is None:
            return {
                "data": {"role": "patient", "user_id": str(current_user.id), "patient_home": None},
                "request_id": _rid(request),
            }
        patient_home = await PatientService(PatientRepository()).get_patient_home(db, str(profile.id), current_user)
        return {
            "data": {
                "role": "patient",
                "user_id": str(current_user.id),
                "patient_home": patient_home,
                **(patient_home or {}),
            },
            "request_id": _rid(request),
        }

    patient_repo = PatientRepository()
    patients = await patient_repo.get_patients_by_user(db, str(current_user.id), current_user)
    patient_map = {str(item.get("id")): item for item in patients}
    patient_ids = [str(item.get("id")) for item in patients if item.get("id")]

    alerts, active_alerts = await AlertRepository().list_alerts(
        db, {"status": "new"}, accessible_patient_ids=patient_ids if patient_ids else []
    )

    practitioner = None
    if current_user.role in ("doctor", "psychologist"):
        practitioner = (
            await db.execute(select(PractitionerProfile).where(PractitionerProfile.user_id == current_user.id))
        ).scalar_one_or_none()

    appointments_today = []
    if practitioner is not None:
        rows = await AppointmentRepository().list_appointments(
            db, practitioner_id=str(practitioner.id), status="scheduled"
        )
        today = datetime.now(timezone.utc).date()
        for row in rows:
            scheduled_at = getattr(row, "scheduled_at", None)
            if scheduled_at is None or scheduled_at.date() != today:
                continue
            patient_id = str(getattr(row, "patient_id", ""))
            patient = patient_map.get(patient_id, {})
            appointments_today.append(
                {
                    "id": str(getattr(row, "id", "")),
                    "patient_id": patient_id,
                    "patient_name": " ".join(
                        part for part in (patient.get("last_name"), patient.get("first_name")) if part
                    ).strip()
                    or None,
                    "scheduled_at": scheduled_at.isoformat(),
                    "status": getattr(row, "status", None),
                    "reason": getattr(row, "reason", None),
                }
            )
        appointments_today.sort(key=lambda item: item["scheduled_at"])

    alert_items = []
    for alert in alerts[:10]:
        patient_id = str(getattr(alert, "patient_id", ""))
        patient = patient_map.get(patient_id, {})
        created_at = getattr(alert, "created_at", None)
        alert_items.append(
            {
                "id": str(getattr(alert, "id", "")),
                "patient_id": patient_id,
                "patient_name": " ".join(
                    part for part in (patient.get("last_name"), patient.get("first_name")) if part
                ).strip()
                or None,
                "type": getattr(alert, "type", None),
                "priority": getattr(alert, "priority", None),
                "status": getattr(alert, "status", None),
                "title": getattr(alert, "title", None),
                "summary": getattr(alert, "summary", None),
                "created_at": created_at.isoformat() if created_at is not None else None,
            }
        )

    practitioner_data = None
    if practitioner is not None:
        practitioner_data = {
            "id": str(practitioner.id),
            "user_id": str(practitioner.user_id),
            "first_name": practitioner.first_name,
            "last_name": practitioner.last_name,
            "middle_name": practitioner.middle_name,
            "specialization": practitioner.specialization,
            "clinic_id": str(practitioner.clinic_id) if practitioner.clinic_id else None,
            "is_active": practitioner.is_active,
        }

    data = {
        "role": current_user.role,
        "practitioner": practitioner_data,
        "stats": {
            "active_patients": len(patients),
            "new_alerts": int(active_alerts),
            "appointments_today": len(appointments_today),
        },
        "alerts": {"active": int(active_alerts), "items": alert_items},
        "appointments_today": appointments_today,
        "recent_patients": patients[:5],
    }
    return {"data": data, "request_id": _rid(request)}
