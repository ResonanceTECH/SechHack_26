"""Агрегатор роутеров API v1."""

from fastapi import APIRouter

from app.api.v1 import auth, health, practitioners, patients

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(practitioners.router)
api_router.include_router(patients.router)
