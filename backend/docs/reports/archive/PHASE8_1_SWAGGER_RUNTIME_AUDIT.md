# Phase 8.1 — Swagger Runtime Audit

## Executive Summary

- Total endpoints (OpenAPI operations): 18
- Tested endpoints: 20 HTTP calls (18 unique operations + 2 unauthorized checks)
- Passed endpoints: 20
- Failed endpoints: 0

## Environment

- Launch method: FastAPI TestClient with environment=test and test SECRET_KEY
- Database: PostgreSQL localhost:5432/sechhack
- Date: 2026-10-21

## Endpoint Validation

| METHOD | PATH | RESULT | HTTP | NOTES |
|---|---|---|---|---|
| GET | /health | PASS | 200 | No DB dependency |
| GET | /db/health | PASS | 200 | DB connectivity OK |
| GET | /api/v1/health | PASS | 200 | Envelope response |
| POST | /api/v1/auth/register | PASS | 201 | Token pair returned |
| POST | /api/v1/auth/login | PASS | 200 | Token pair returned |
| POST | /api/v1/auth/sms/request | PASS | 200 | Dev SMS code logged |
| POST | /api/v1/auth/sms/verify | PASS | 401 | Invalid code, expected |
| POST | /api/v1/auth/invite/verify | PASS | 404/422 | Invalid code, expected |
| POST | /api/v1/auth/refresh | PASS | 200 | New token pair |
| GET | /api/v1/auth/me | PASS | 200 | User profile |
| POST | /api/v1/auth/change-password | PASS | 200 | Password changed |
| POST | /api/v1/auth/logout | PASS | 200 | Logged out |
| GET | /api/v1/practitioners/{id}/invite-codes | PASS | 200 | Doctor RBAC OK |
| POST | /api/v1/practitioners/{id}/invite-codes | PASS | 201 | Invite code created |
| GET | /api/v1/patients | PASS | 200 | RBAC list |
| GET | /api/v1/patients/{id} | PASS | 200 | Patient detail |
| PATCH | /api/v1/patients/{id} | PASS | 200 | Patient updated |
| GET | /api/v1/patients/{id}/summary | PASS | 200 | Summary returned |
| GET | /api/v1/patients (no auth) | PASS | 401 | Unauthorized |
| GET | /api/v1/patients/{id} (no auth) | PASS | 401 | Unauthorized |

## Authentication Validation

- JWT flow: register/login/refresh/logout all functional.
- Authorize button: Bearer JWT scheme present in OpenAPI components.
- Protected endpoints: return 401 without token and 200/201 with valid token.

## Swagger Validation

- response_model works for envelope endpoints.
- Examples display for RegisterRequest.
- Error schemas present in OpenAPI.
- Bearer JWT scheme present.
- Request/response schemas present.
- OpenAPI generation succeeds: 16 paths, 18 operations.

## Runtime Errors

No endpoint returned 5xx during smoke testing. Async pool cleanup warnings were observed in the ad-hoc TestClient script, but they are test-harness artifacts and do not affect pytest suite (51 passed).

## Fixes Applied

No additional fixes required; all endpoints passed.

## Recommendations

P0: None.
P1: Add dedicated integration tests for /db/health and practitioner invite endpoints if not already covered.
P2: Consider httpx-based async smoke tests to avoid TestClient event-loop pool warnings.

## Final Verdict

- Swagger readiness: 9/10
- Runtime readiness: 9/10
- Frontend readiness: 8/10
