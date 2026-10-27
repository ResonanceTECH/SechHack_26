# Phase 1 Audit Report — Documentation & Code Reconciliation

**Subject:** Clinical Compass Backend — Phase 1 documentation/code audit, RBAC reconciliation, and test verification
**Date:** 2026-10-21
**Scope:** `clinicalcompass/docs/product/backend/` and `SechHack_26/backend/`
**Status:** ✅ Complete (Phase 1 audit, RBAC alignment, lint/test verification done)

---

## 1. Executive Summary

| Metric | Value |
|---|---|
| Audit scope | 12 documentation files + backend source |
| Issues found & fixed | 5 (2 doc, 3 code) |
| Tests | 37 unit tests — **37 passed** |
| Ruff | All checks passed |
| Mypy | Success (no issues) |
| Migrations | No DB changes needed (external review) |
| Open items | None blocking |

This report documents the Phase 1 audit: documentation/code reconciliation against `AUTH_PLAN.md §5.2` (RBAC single source of truth), fixing the invite-code entity_id audit bug, cleaning the `care.py` alias/duplicate, syncing model exports, and reconciling RBAC matrices in `MODULES.md` and `MEDICATIONS.md`.

---

## 2. Issues Found & Fixed

### 2.1 `app/services/invite_service.py` — Audit `entity_id` hardcoded

**Problem:** Audit log recorded `entity_id=uuid.uuid4()` instead of the actual assigned invite code ID.

**Fix:** Captured `assignment.id` after `session.flush()` and used it in the audit record:

```python
assignment = InviteCode(...)
session.add(assignment)
await session.flush()
...
await audit_service.record(
    session,
    user_id=user_id,
    action=action,
    entity_type="InviteCode",
    entity_id=assignment.id,   # ← was uuid.uuid4()
)
```

**Files:** `SechHack_26/backend/app/services/invite_service.py`

### 2.2 `app/models/care.py` — `ExerciseCompletion` alias / duplicate classes

**Problem:** Broken alias `ExerciseCompletion = _ExerciseCompletion` + duplicate class definitions caused import confusion and type confusion.

**Fix:** Removed the alias and duplicate classes; aligned the model to `DB_SCHEMA.md`.

**Files:** `SechHack_26/backend/app/models/care.py`

### 2.3 `app/models/__init__.py` — Model export sync

**Problem:** Exported model names did not match the canonical model set in `DB_SCHEMA.md`.

**Fix:** Synced `__all__` / `__init__` exports to the canonical list.

**Files:** `SechHack_26/backend/app/models/__init__.py`

### 2.4 Documentation — `AUTH_PLAN.md` & `DOMAIN_MODEL.md`

**Problem:** Invite-code alphabet contract in docs was incorrect (missed `L` and `U`).

**Fix:** Updated the invite-code alphabet to the confirmed 32-char contract:
`23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (0/1/I/O excluded).

**Files:** `clinicalcompass/docs/product/backend/AUTH_PLAN.md`, `DOMAIN_MODEL.md`

### 2.5 Documentation — `MEDICATIONS.md` & `MODULES.md` RBAC alignment

**Problem:** RBAC visibility matrix rows were misaligned with `AUTH_PLAN.md §5.2` semantics (MedicationBrief/MedicationFull visibility, coordinator rows).

**Fix:** Reconciled both files' RBAC matrix to match `AUTH_PLAN.md §5.2`.

**Files:** `clinicalcompass/docs/product/backend/MEDICATIONS.md`, `MODULES.md`
(TASKS.md duplicate content also cleaned; TESTS.md phase ordering corrected per prior audit.)

---

## 3. RBAC Single Source of Truth — `AUTH_PLAN.md §5.2`

| Role | patient | doctor | psychologist | coordinator | clinic_admin | super_admin |
|---|---|---|---|---|---|---|
| **MedicationBrief** (patient view, MEDICATIONS.md) | ✅ brief | — | — | — | — | — |
| **MedicationFull** (doctor view, MEDICATIONS.md) | — | ✅ full | — | — | — | — |
| **patient-service** (MODULES.md) | ✅ own | ✅ | ✅ | ✅ | ✅ | ✅ |
| **medication-service** (MODULES.md) | brief | full | full | brief | full | full |
| **program-service** (MODULES.md) | ✅ own | ✅ | ✅ | ❌ | ❌ | ✅ |

> **Note:** `MedicationBrief` = short list (patient-facing); `MedicationFull` = full clinical card (doctor-facing). `coordinator` rows updated to match §5.2.

---

## 4. Test / Lint / Migration Results

| Check | Command | Result |
|---|---|---|
| Unit tests | `python -m pytest tests/unit -x -q` | **37 passed** |
| Ruff | `ruff check app/` | All checks passed |
| Mypy | `mypy --config-file pyproject.toml app/` | Success (no issues) |

- Mypy false positive in `auth_service.py` was silenced with a targeted `# type: ignore[attr-defined]` on `result.rowcount` (runtime contract unchanged).
- DB migration verified manually via existing `alembic` output; no migration files modified in this pass.
- `SKIP_DB_TESTS=1` path exercised: 37/37 unit tests pass without Postgres.

---

## 5. Open Items & Follow-ups

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | Confirm Postgres-backed integration tests (only skipped in this env) | Backend team | Pending |
| 2 | Re-run `TESTS.md §2` full suite including `tests/security/*` after Phase 2 merges | Backend team | In progress |
| 3 | Figma v2 frames already read for patient mobile / doctor web; no report file needed | Frontend | Done |

---

## 6. Files Changed in This Audit

**Backend source (`SechHack_26/backend/`):**
- `app/services/invite_service.py` — audit `entity_id` fix
- `app/models/care.py` — ExerciseCompletion alias/duplicate removal
- `app/models/__init__.py` — model export sync
- `app/services/auth_service.py` — `rowcount` mypy type-ignore added

**Documentation (`clinicalcompass/docs/product/backend/`):**
- `AUTH_PLAN.md` — invite-code alphabet contract fixed
- `DOMAIN_MODEL.md` — invite-code alphabet contract fixed
- `MEDICATIONS.md` — RBAC visibility matrix reconciled to §5.2
- `MODULES.md` — RBAC matrix reconciled to §5.2
- `TESTS.md` — phase ordering corrected
- `TASKS.md` — duplicate content cleaned

**Report artifact:** `PHASE1_AUDIT_REPORT.md`
