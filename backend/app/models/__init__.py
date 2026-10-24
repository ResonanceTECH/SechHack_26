"""Модели SQLAlchemy — концепт01 (общий контур). Импорт здесь нужен Alembic
для autogenerate: metadata должен знать все таблицы."""

from app.models.appointment import Appointment
from app.models.assignment import PatientAssignment
from app.models.audit import AuditLog
from app.models.auth import InviteCode, RefreshToken, SmsCode
from app.models.care import Alert, CarePlan, ExerciseAssignment, ExerciseCompletion
from app.models.clinic import Clinic
from app.models.clinical import DiaryEntry, ScreeningResult
from app.models.diagnosis import DiagnosisReference, PatientDiagnosis
from app.models.integration import IntegrationEvent
from app.models.medication import Medication, Prescription, MedicationAdherence
from app.models.message import Message

from app.models.profile import PatientProfile, PractitionerProfile
from app.models.safety import CrisisSignal, SafetyPlan
from app.models.schedule import ClinicSettings, PractitionerSchedule, PractitionerScheduleException
from app.models.user import User

__all__ = [
    "Appointment",
    "Alert",
    "AuditLog",
    "CarePlan",
    "Clinic",
    "DiaryEntry",
    "ExerciseAssignment",
    "ExerciseCompletion",
    "DiagnosisReference",
    "PatientDiagnosis",

    "IntegrationEvent",
    "Medication",
    "MedicationAdherence",
    "Message",
    "Prescription",
    "InviteCode",
    "PatientAssignment",
    "PatientProfile",
    "PractitionerProfile",
    "RefreshToken",
    "ScreeningResult",
    "ClinicSettings",
    "PractitionerSchedule",
    "PractitionerScheduleException",
    "SmsCode",
    "User",
]
