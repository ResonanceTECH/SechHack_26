# PHASE 26 — Schedule and clinic settings

## Executive Summary
Implemented schedule/clinic settings models, migration 0018, repositories, service, API endpoints, permissions, OpenAPI, docs.

## Files Changed
- app/models/schedule.py
- app/models/__init__.py
- app/core/permissions.py
- alembic/versions/0018_schedule.py
- app/schemas/schedule.py
- app/repositories/schedule_repository.py
- app/services/schedule_service.py
- app/api/v1/schedule.py
- app/api/v1/router.py
- docs/BACKEND_SPEC.md
- docs/openapi.json

## Database Changes
- clinic_settings, practitioner_schedules, practitioner_schedule_exceptions tables.

## API Changes
- GET/PUT /api/v1/clinics/{clinic_id}/settings
- GET/PUT /api/v1/practitioners/{id}/schedule
- POST/DELETE /api/v1/practitioners/{id}/schedule/exceptions/{exception_id}

## Tests
- 102 passed.

## Risks
- No availability calculation yet; no clinic isolation enforcement in service.

## Next Step
- Availability calculation + tests.