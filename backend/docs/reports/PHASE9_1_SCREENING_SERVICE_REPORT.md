# PHASE 9.1 SCREENING SERVICE REPORT

## Implemented
- Migration `alembic/versions/0002_screening_base.py` applied (head).
- Questionnaire definitions `app/core/questionnaires.py`.
- Scoring service `app/services/screening_service.py` (PHQ-9/GAD-7 scoring, interpretation, critical flags, server-side score).
- Repository `app/repositories/screening_repository.py`.
- Schemas `app/schemas/screening.py`.
- API `app/api/v1/screenings.py` + router registration.
- Tests: unit, API, integration (61 passed).

## Endpoints
- GET /api/v1/screenings
- POST /api/v1/screenings
- GET /api/v1/screenings/{id}
- GET /api/v1/patients/{id}/screenings

## Critical flags
- PHQ-9: q9 >= 1 OR score >= 20
- GAD-7: score >= 15
