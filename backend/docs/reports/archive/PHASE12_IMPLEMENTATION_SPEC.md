# PHASE 12 — IMPLEMENTATION SPEC

Scope: Diagnosis Layer (PatientDiagnosis + DiagnosisReference), ICD-10/ICD-11 future-proof, Patient Card diagnosis view.

Дата: 2026-10-23

---

# 1. Implementation Order

1. Create `DiagnosisReference` model + migration + seed ICD-10.
2. Create `PatientDiagnosis` model (evolution of `Icd10Code`) + migration.
3. Add partial unique index for one primary diagnosis per patient.
4. Implement repositories/services for diagnosis CRUD + close/remission.
5. Implement API endpoints `/api/v1/diagnoses` (+ deprecated alias `/api/v1/icd10`).
6. Add Patient Card diagnosis view (active + history + primary).
7. RBAC enforcement + audit logging.
8. Tests (unit/integration/API/security).
9. Update CURRENT_API.md, DOMAIN_MODEL.md, DB_SCHEMA.md.

---

# 2. Database Changes

## New table: diagnosis_references
- id (UUID, PK)
- coding_system (enum: ICD10, ICD11)
- code (VARCHAR, NOT NULL)
- title (VARCHAR, NOT NULL) — ru
- title_en (VARCHAR, NULL)
- chapter (VARCHAR, NULL)
- parent_code (VARCHAR, NULL)
- is_active (BOOLEAN, default true)
- version (VARCHAR, NULL)
- UNIQUE(coding_system, code)

## New/renamed table: patient_diagnoses (evolution of icd10_codes)
- id (UUID, PK)
- patient_id (FK patients, NOT NULL, indexed)
- coding_system (enum: ICD10, ICD11, NOT NULL)
- code (VARCHAR, NOT NULL)
- title (VARCHAR, NULL)
- is_primary (BOOLEAN, default false)
- status (enum: active, resolved, remission, closed, NOT NULL, default active)
- diagnosed_at (TIMESTAMPTZ, NOT NULL)
- ended_at (TIMESTAMPTZ, NULL)
- diagnosed_by (FK practitioners, NULL)
- is_confirmed (BOOLEAN, default false)
- notes (TEXT, NULL)
- created_at (TIMESTAMPTZ, NOT NULL)
- updated_at (TIMESTAMPTZ, NOT NULL)
- Indexes: patient_id, code, is_primary, status
- Partial unique index: (patient_id) WHERE is_primary = TRUE

## Migration strategy
- Option A: rename `icd10_codes` → `patient_diagnoses` + add columns (coding_system default ICD10, status default active, updated_at).
- Add `diagnosis_references` table.
- Seed ICD-10 reference data via migration data step (or separate seed script; migration preferred for reproducibility).

---

# 3. Migration Order

1. 0006_diagnosis_references.py — create table + seed ICD-10.
2. 0007_patient_diagnoses.py — rename icd10_codes → patient_diagnoses, add columns, backfill coding_system='ICD10', status='active', updated_at=created_at, partial unique index.
3. Verify upgrade → downgrade → upgrade.

---

# 4. RBAC Matrix

| Action | patient | practitioner (own patient) | practitioner (other) | admin |
|---|---|---|---|---|
| List diagnoses (patient own) | read | read | read (if assigned) | read |
| Create diagnosis | no | yes (own patient) | no | yes |
| Update diagnosis (status/primary/notes) | no | yes (own patient) | no | yes |
| Close diagnosis | no | yes (own patient) | no | yes |
| Manage DiagnosisReference | no | no | no | yes |

Rules:
- Patient can read own diagnoses (read-only).
- Practitioner can mutate only patients assigned to them (ownership check).
- Admin full access.
- All mutations audit-logged (actor, action, resource, timestamp).

---

# 5. Testing Strategy

## Unit
- Model validation (status enum, coding_system enum).
- Service logic: primary diagnosis uniqueness, close/remission transitions.

## Integration
- Repository CRUD against test DB.
- Migration upgrade/downgrade/upgrade.

## API
- CRUD endpoints happy path + validation errors.
- RBAC: 403 for unauthorized, 404 for missing.
- Deprecated alias `/api/v1/icd10` compatibility.

## Security
- Ownership enforcement tests.
- Audit log entries created on mutation.

---

# 6. Definition of Done

- [ ] Models + migrations implemented and verified (upgrade → downgrade → upgrade).
- [ ] Partial unique index for primary diagnosis in place.
- [ ] `/api/v1/diagnoses` endpoints documented in OpenAPI and CURRENT_API.md.
- [ ] Deprecated `/api/v1/icd10` alias maintained or documented removal plan.
- [ ] Patient Card diagnosis view functional.
- [ ] RBAC matrix enforced and tested.
- [ ] All tests green (pytest).
- [ ] Documentation updated (DOMAIN_MODEL, DB_SCHEMA, CURRENT_API).
- [ ] Phase report created (`PHASE12_REPORT.md`).
