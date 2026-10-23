"""????????? ???????? API v1."""

from fastapi import APIRouter

from app.api.v1 import auth, health, practitioners, patients, screenings, questionnaires, alerts, diagnoses

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
