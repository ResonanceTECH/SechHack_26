# Phase 35 Report — Patient Name History (Partial)

## Executive Summary
Added `patient_name_history` table and SQLAlchemy model to support strict clinical history of patient name changes (Phase 14). Migration verified upgrade/downgrade/upgrade. Tests remain green (102 passed).

## Files Changed
- `backend/app/models/profile.py` — added `PatientNameHistory` model.
- `backend/alembic/versions/0023_patient_name_history.py` — new migration.
- `backend/docs/BACKEND_SPEC.md` — Phase 14 updated.

## Database Changes
- New table `patient_name_history` with patient FK, changed_by, changed_at, reason, effective_from/to, old/new names.

## API Changes
None.

## Tests
- 102 passed; migration upgrade → downgrade → upgrade verified.

## Risks
- Versioning/addendum/retention policy for other clinical entities remains planned.

## Next Step
- Continue Phase 14 and frontend integration/release.