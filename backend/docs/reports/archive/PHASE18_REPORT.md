# PHASE 18 REPORT — Adherence Block (Patient Card)

## Executive Summary
Implemented Adherence block in `GET /api/v1/patients/{id}/summary` using existing care plan / exercise completion data (care plan adherence). Added migration 0010 for care_plans, exercise_assignments, exercise_completions.

## Files Changed
- app/services/patient_service.py
- tests/test_patients_api.py
- docs/TASKS.md, docs/DB_SCHEMA.md, docs/DOMAIN_MODEL.md

## Database Changes
None.

## API Changes
- `GET /api/v1/patients/{id}/summary` now includes `adherence` block with screening check-in metrics.

## Tests
- tests/test_patients_api.py::test_get_patient_summary_endpoint — PASS

## Risks
- Adherence metric currently based on screening frequency, not medication adherence (medication service not implemented).

## Next Step
- Implement Screening trends block in Patient Card summary (standalone `GET /api/v1/patients/{id}/screening-trend` endpoint exists since Phase 16; missing aggregate block).