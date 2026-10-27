# Phase 51 Report — Patient home today_tasks aggregate

## Executive Summary

Extended patient home aggregates with `today_tasks[]` for mobile/web home screens. `GET /api/v1/patients/{id}/home` and `GET /api/v1/home/dashboard` (patient branch) now include check-in status, active medication tasks, and today appointment task. OpenAPI and docs synchronized.

## Files Changed

- `backend/app/api/v1/patients.py`
- `backend/app/api/v1/home.py`
- `backend/docs/openapi.json`
- `backend/docs/BACKEND_SPEC.md`
- `backend/docs/CLIENT_MAPPING.md`

## Database Changes

None.

## API Changes

- `GET /api/v1/patients/{id}/home` — added `today_tasks[]`.
- `GET /api/v1/home/dashboard` (patient) — added `today_tasks[]`.

## Tests

- Full suite: 148 passed.

## Risks

- Aggregation performs additional repository calls per request; acceptable for home-screen use.

## Next Step

- Implement universal entity versioning/addendum + retention policy (Phase 52), wiring `entity_versions` (migration 0032) to clinical mutations.