"""Модели SQLAlchemy — концепт01 (общий контур). Импорт здесь нужен Alembic
для autogenerate: metadata должен знать все таблицы."""

from app.models.assignment import PatientAssignment
from app.models.audit import AuditLog
from app.models.auth import InviteCode, RefreshToken, SmsCode
from app.models.care import Alert, CarePlan, ExerciseAssignment, ExerciseCompletion
from app.models.clinic import Clinic
from app.models.clinical import DiaryEntry, ScreeningResult
from app.models.profile import PatientProfile, PractitionerProfile
from app.models.user import User

__all__ = [
    "Alert",
    "AuditLog",
    "CarePlan",
    "Clinic",
    "DiaryEntry",
    "ExerciseAssignment",
    "ExerciseCompletion",
    "InviteCode",
    "PatientAssignment",
    "PatientProfile",
    "PractitionerProfile",
    "RefreshToken",
    "ScreeningResult",
    "SmsCode",
    "User",
]
