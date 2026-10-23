# PHASE 15 — MEASUREMENT BASED CARE (MBC) REPORT

## Executive Summary
Implemented AssessmentPlan layer linking Diagnosis → Assessment Plan → Questionnaire Schedule → Screening Results → Trends. Added domain model, migration 0008, repository, service, API, RBAC, patient summary integration, tests, OpenAPI regeneration.

## Files Changed
- app/models/assessment_plan.py
- app/repositories/assessment_plan_repository.py
- app/services/assessment_plan_service.py
- app/schemas/assessment_plan.py
- app/api/v1/assessment_plans.py
- app/api/v1/router.py
- app/core/permissions.py
- app/services/patient_service.py
- alembic/versions/0008_assessment_plans.py
- tests/api/test_assessment_plans_api.py
- docs/CURRENT_API.md
- docs/openapi.json

## Database Changes
- New table `assessment_plans` with FKs to patient_profiles, patient_diagnoses, users; CHECK interval_days > 0; indexes.
- Migration verified upgrade → downgrade → upgrade.

## API Changes
- GET/POST /api/v1/assessment-plans
- GET/PUT/DELETE /api/v1/assessment-plans/{id}
- patient summary includes assessment active plans, next due, overdue.

## Tests
- 82 passed (4 new assessment plan API tests).

## Risks
- next_due_date calculation uses server date and plan start/created_at; no notifications yet.
- No FK to questionnaire registry (validated in service).

## Next Step
- Diary rework and Safety Plan content library.
