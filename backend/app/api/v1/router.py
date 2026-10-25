"""API v1 router."""

from fastapi import APIRouter

from app.api.v1 import auth, health, practitioners, patients, screenings, questionnaires, alerts, diagnoses, assessment_plans, safety, diary, integrations, medications, exercises, messages, appointments, reports, admin, audit, schedule, assignments, users


api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(practitioners.router)
api_router.include_router(patients.router)
api_router.include_router(screenings.router)
api_router.include_router(screenings.patient_screenings_router)
api_router.include_router(questionnaires.router)
api_router.include_router(alerts.router)

api_router.include_router(diagnoses.router)
api_router.include_router(diagnoses.patient_diagnoses_router)

api_router.include_router(diagnoses.icd10_router)
api_router.include_router(assessment_plans.router)
api_router.include_router(safety.router)
api_router.include_router(diary.router)
api_router.include_router(integrations.router)
api_router.include_router(medications.medications_router)
api_router.include_router(medications.prescriptions_router)
api_router.include_router(medications.adherence_router)

api_router.include_router(exercises.care_plans_router)
api_router.include_router(exercises.exercises_router)
api_router.include_router(messages.messages_router)
api_router.include_router(appointments.appointments_router)

api_router.include_router(admin.admin_router)
api_router.include_router(audit.audit_router)
api_router.include_router(reports.reports_router)
api_router.include_router(schedule.schedule_router)
api_router.include_router(assignments.assignments_router)
api_router.include_router(users.router)
