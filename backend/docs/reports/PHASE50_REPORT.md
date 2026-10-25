# Phase 50 Report — Home dashboard endpoint

## Executive Summary

Added GET /api/v1/home/dashboard, a role-aware aggregation endpoint for patient and clinician home screens. Patient responses reuse the existing patient home aggregate. Doctor/psychologist responses aggregate practitioner profile, patient/alert/appointment stats, active alert items, today's appointments, and recent patients. Router registration, OpenAPI, backend spec, client mapping, and audit report were synchronized.

## Files Changed

- ackend/app/api/v1/home.py (new)
- ackend/app/api/v1/router.py
- ackend/tests/api/test_home_dashboard_api.py (new)
- ackend/docs/openapi.json
- ackend/docs/BACKEND_SPEC.md
- ackend/docs/CLIENT_MAPPING.md
- ackend/docs/reports/AUDIT_PRE_FRONTEND_INTEGRATION.md

## Database Changes

None.

## API Changes

- Added GET /api/v1/home/dashboard (auth required).
- Patient payload includes ole, user_id, patient_home, plus flattened patient home fields.
- Clinician payload includes ole, practitioner, stats, lerts, ppointments_today, and ecent_patients.

## Tests

- Added 3 API tests for patient, doctor, and unauthenticated access.
- Full suite: 140 passed.

## Risks

- Aggregation performs several repository calls per request; acceptable for current home-screen use.
- Patient with no PatientProfile returns a null patient_home aggregate instead of 404.

## Next Step

- Align frontend/mobile home screens to consume /api/v1/home/dashboard.
- Add dedicated mobile 	oday_tasks aggregation if required by the mobile home screen.
