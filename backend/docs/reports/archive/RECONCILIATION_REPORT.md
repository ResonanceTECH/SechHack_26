# RECONCILIATION REPORT

## Executive Summary

Проведена сверка кода, миграций, OpenAPI и документации. Исправлена CURRENT_API.md: устранены неверные safety endpoints, добавлены patient summary, screening trend, alerts, ICD-10 alias. Runtime rebuild/up/health/OpenAPI/tests пройдены.

## Found

- Safety endpoints in CURRENT_API.md described old `/signal`, `/signals` paths; actual `/plans`, `/crisis-signals`.
- Safety plan documented as planned `/safety-plan`, but implemented as `/safety/plans`.
- Patient Summary and screening trend were missing from CURRENT_API.md.
- Alerts endpoints missing from CURRENT_API.md.
- OpenAPI contains 50 paths incl. alerts, assessment plans, diagnoses, safety.

## Fixed

- Updated CURRENT_API.md to match OpenAPI.
- Clarified Patient Summary boundaries (safety and screening trend standalone).
- Runtime image rebuilt with `--no-cache`, stack recreated.

## Changed docs

- `backend/docs/CURRENT_API.md`

## Changed endpoints

No endpoint behavior changes. Documentation aligned to existing endpoints.

## Changed tests

No test code changes in this phase; existing 87 tests pass.

## Feature table

| Feature | Code | OpenAPI | Docs | Runtime | Tests | Status |
|---|---|---|---|---|---|---|
| Patient Summary | implemented | implemented | aligned | verified | covered | PASS |
| Safety plans | implemented | implemented | aligned | verified | covered | PASS |
| Crisis signals | implemented | implemented | aligned | verified | covered | PASS |
| Screening trends | implemented | implemented | aligned | verified | covered | PASS |
| Adherence | implemented | n/a aggregate | aligned | verified | covered | PASS |
| RBAC | implemented | enforced | aligned | verified | covered | PASS |
| OpenAPI | generated | valid | aligned | verified | n/a | PASS |

## Final verdict

READY_FOR_FRONTEND_INTEGRATION

Remaining issues: none blocking. C-SSRS and medication skip remain unimplemented by design/current scope.
