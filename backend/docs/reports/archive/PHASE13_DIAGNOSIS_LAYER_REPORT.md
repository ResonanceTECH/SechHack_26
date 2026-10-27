# Executive Summary

Implemented Diagnosis Layer with `PatientDiagnosis` entity supporting ICD-10/ICD-11, lifecycle status, multiple diagnoses, primary diagnosis uniqueness, and RBAC. Added Alembic migration, API endpoints, patient card summary extension, permissions, and tests.

# Migration

- Added `0006_patient_diagnoses` creating `patient_diagnoses`.
- Verified upgrade -> downgrade -> upgrade.

# Domain Model

- New model `PatientDiagnosis` with coding_system, code, title, is_primary, status, diagnosed_at, ended_at, diagnosed_by, is_confirmed, notes, timestamps.
- Partial unique index ensures one active primary diagnosis per patient.

# API

- `GET /api/v1/diagnoses`
- `POST /api/v1/diagnoses`
- `GET /api/v1/diagnoses/{id}`
- `PUT /api/v1/diagnoses/{id}`
- `GET /api/v1/patients/{id}/diagnoses`
- Patient summary includes diagnoses.

# RBAC

- Doctor: create/update/close.
- Psychologist/coordinator/patient: read (patient own).
- Enforced via diagnosis:read/diagnosis:write permissions.

# OpenAPI

- Schemas and endpoints registered via FastAPI routers; Swagger reflects routes.

# Tests

- `tests/api/test_diagnoses_api.py`: 4 passed.

# Risks

- No DiagnosisReference reference table yet; titles supplied by client.
- Clinic isolation not enforced for diagnosis endpoints (MVP).

# Next Phase

- Add DiagnosisReference and ICD seeding.
- Enforce clinic isolation and assignment checks.
