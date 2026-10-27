# PHASE 9.2 QUESTIONNAIRE REGISTRY REPORT

## Changes
- Added backend questionnaire registry (`app/core/questionnaire_registry.py`) for PHQ-9 and GAD-7.
- Added questionnaire API endpoints under `/api/v1/questionnaires`.
- Hardened screening validation against registry versions.
- Added `severity` and `critical_reason` fields to ScreeningResult.
- Added migration `0003_screening_hardening`.
- Backward-compatible scoring helpers retained.

## Risks Reduced
- Backend is now source of truth for questionnaire definitions.
- Unknown questionnaire/version rejected.
- Versioned definitions enable future questionnaires.

## Readiness
- Mobile/frontend can fetch definitions and versions.
- Alert Service receives severity and critical_reason.
- Foundation supports PHQ-2, GAD-2, HADS, ISI, PCL-5 by registry extension.
