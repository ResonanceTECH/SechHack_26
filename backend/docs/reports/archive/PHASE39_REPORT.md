# Phase 39 Report — Audit Events and RLS Preparation

## Executive Summary
Added `audit_events` table and `AuditEvent` model for security/PHI access audit. Added RLS preparation policy on `patient_profiles` (clinic isolation, backward-compatible when context is unset). Migration verified, tests green (102).

## Files Changed
- `backend/alembic/versions/0027_audit_events.py`
- `backend/alembic/versions/0028_rls_patient_profiles.py`
- `backend/app/models/audit.py`
- `backend/app/models/__init__.py`
- `backend/app/services/audit_service.py`
- `backend/docs/BACKEND_SPEC.md`

## Database Changes
- `audit_events`: audit/security events with actor, clinic, patient, action, resource, result, request metadata.
- RLS enabled on `patient_profiles` with policy `clinic_isolation_patient_profiles`.

## API Changes
None.

## Tests
- 102 passed; migration upgrade → downgrade → upgrade verified.

## Risks
- RLS policy is permissive until `app.current_clinic_id` is set per request.
- Audit logging is available but not yet wired into every service path.
- Multi-clinic membership not implemented yet.

## Next Step
- Phase 40: multi-clinic membership model and clinic isolation rollout.