# CLINICAL COMPASS — AGENT RULES

IMPORTANT

This document supplements MASTER_MAPPING.MD. If rules overlap, MASTER_MAPPING.MD has priority. Do not duplicate or reinterpret `MASTER_MAPPING.MD`

## Purpose

This file defines permanent operating rules for AI agents.

Do not use this file to determine project status.

Implementation status must always be derived from current code and current documentation.

---

# Source Of Truth Hierarchy

When sources conflict, use the following priority:

1. Source code
2. Database migrations (Alembic versions)
3. OpenAPI / Swagger (`docs/openapi.json`, runtime `GET /openapi.json`)
4. `docs/BACKEND_SPEC.md` — single backend meta-specification (stack, domain model, architecture, modules, auth/RBAC, testing, implementation plan)
5. `docs/CLIENT_MAPPING.md` — client contracts (mobile + frontend screen → endpoint mappings)
6. Reports (`docs/reports/`)

Code always overrides documentation.

Documentation always overrides reports.

Reports never override code.

---

# Client Integration Audit References (MANDATORY CONTEXT)

For backend hardening and client (frontend/mobile) integration work, the following audit reports are mandatory context and must be consulted before changing API contracts or DTOs:

- `docs/reports/AUDIT_PRE_FRONTEND_INTEGRATION.md` — pre-frontend audit: verified gaps, contract coverage (~95%), roadmap (search param, aggregated home endpoint, N+1 patient card).
- `docs/reports/FIGMA_DTO_VERIFICATION.md` — field-by-field DTO verification for 45 mobile + 60 web screens; contract mismatch summary.
- `docs/CLIENT_INTEGRATION.md`

These reports do NOT override code, migrations, OpenAPI, or `BACKEND_SPEC.md`/`CLIENT_MAPPING.md`. They provide verified gap lists and must be updated when the corresponding gaps are closed.

# Documentation Sync Rule (MANDATORY)

After **any** change to source code, migrations, schemas, API endpoints, response envelopes, RBAC, or client-facing behavior, the agent MUST update the following in the same change:

- `docs/BACKEND_SPEC.md` — domain model, module status, architecture, API inventory
- `docs/CLIENT_MAPPING.md` — screen → endpoint matrix, client flows, error handling
- `docs/openapi.json` — regenerate committed OpenAPI from the running FastAPI app (`GET /openapi.json`) and verify it reflects the changes
- When closing a verified gap listed in `docs/reports/AUDIT_PRE_FRONTEND_INTEGRATION.md` or `docs/reports/FIGMA_DTO_VERIFICATION.md`, update those reports in the same change.

No implementation phase is complete without all three being synchronized.

---

# Mandatory Verification Rule

Before performing any implementation task:

1. Verify actual implementation from source code.
2. Verify database migrations (upgrade → downgrade → upgrade locally).
3. Verify OpenAPI / Swagger (`GET /openapi.json` is valid and reflects changes).
4. Read `docs/BACKEND_SPEC.md` and `docs/CLIENT_MAPPING.md` for context.
5. For integration-related tasks, also read `docs/reports/AUDIT_PRE_FRONTEND_INTEGRATION.md` and `docs/reports/FIGMA_DTO_VERIFICATION.md`.
6. Verify Docker runtime if runtime validation is required.

Never assume a feature exists.

Never assume a feature does not exist.

Verify first.

---

# Git Rules

AI agents must NEVER:

- create commits
- amend commits
- push commits
- force push
- merge branches
- rebase branches
- create tags
- reset history
- rewrite history
- cherry-pick commits

Allowed:

- git status
- git diff
- git log
- git show
- git branch
- repository inspection

The human operator owns repository history.

The human operator is solely responsible for:

- commits
- commit messages
- pull requests
- merges
- releases

---

# Docker Rules

Never assume a running container contains the latest code.

Before runtime validation:

- inspect containers (`docker compose ps`)
- inspect images
- inspect migrations
- inspect health endpoints (e.g. `/health` or `/api/v1/health`)
- inspect logs (`docker compose logs`)

If runtime freshness matters:

docker compose down
docker compose build --no-cache
docker compose up -d

Runtime behavior must be validated against the currently running stack.

---

# Database Rules

Any schema change requires:

- model update
- Alembic migration
- tests
- documentation update

Manual schema modification is forbidden.

Migration and implementation must be delivered together.

Every migration must include a working `downgrade()` and be verified locally (upgrade → downgrade → upgrade).

When a new configuration value (environment variable) is introduced, update `.env.example` in the same change.

---

# Documentation Rules

### BACKEND_SPEC.md

single source of truth for backend architecture, domain entities, persistence model, authentication/authorization behavior, module inventory, testing strategy, and implementation plan.

### CLIENT_MAPPING.md

describes client contracts (mobile + frontend screen → endpoint mappings, auth/SMS/invite flows, error handling, OpenAPI bundle reference).

Do not remove future endpoints from CLIENT_MAPPING.md because they are not yet implemented.

Whenever API behavior changes:

update BACKEND_SPEC.md, CLIENT_MAPPING.md, and regenerate committed OpenAPI (`docs/openapi.json`).

Documentation changes belong in the same implementation phase.

OpenAPI must be updated when API behavior changes.

Documentation changes belong in the same implementation phase.

---

# Testing Rules

Every implementation phase must end with:

- green pytest
- migration verification (upgrade → downgrade → upgrade)
- OpenAPI verification (`GET /openapi.json` is valid and reflects changes)

Do not disable tests.

Do not remove tests to achieve green builds.

Do not replace tests with documentation.

New functionality requires tests.

Minimum expected categories:

- unit
- integration
- API

Security-sensitive functionality additionally requires security tests.

---

# API Rules

Use the standard response envelope:

{
  "data": ...,
  "meta": ...,
  "error": ...
}

Authorization behavior must follow BACKEND_SPEC.md.

RBAC definitions must not be duplicated across multiple sources.

OpenAPI must be updated when API behavior changes.

---

# Security Rules

Never commit:

- .env
- secrets
- private keys
- access tokens
- refresh tokens
- API keys
- production credentials

Only:

.env.example

may be committed.

Configuration must come from environment variables.

---

# Architecture Rules

BACKEND_SPEC.md defines architectural constraints, domain entities, persistence model, and authentication/authorization behavior.

If implementation intentionally diverges from these documents:

update the documents in the same phase.

---

# White Paper Rules

White_Paper.MD defines product vision.

It is not an implementation specification.

Implementation decisions must come from:

- code
- BACKEND_SPEC.md
- CLIENT_MAPPING.md

Do not implement speculative functionality solely because it appears in brainstorming notes, research notes, white papers, or future vision documents.

---

# Frontend And Mobile Rules

Frontend and mobile applications are API consumers.

Do not modify backend contracts solely to satisfy mocks.

Backend behavior is defined by:

- code
- OpenAPI
- BACKEND_SPEC.md

Clients must adapt to actual API contracts.

If an agent claims a screen uses the backend, it must show:

- API client code;
- fetch/axios/query call;
- endpoint mapping in CLIENT_MAPPING.md.

If API calls are not found:

Status = UNVERIFIED

If mock data is used:

Status = MOCK ONLY

If a screen exists but has no backend connection:

Status = UI ONLY

---

# Figma Rules

Do not claim:

"Backend supports a screen"

unless the mapping is built:

Screen -> UI elements -> DTO fields -> Endpoint -> OpenAPI schema

Without such mapping:

Status = UNVERIFIED

---

# Test Coverage Rules

The existence of a test does not mean coverage.

For each feature determine:

Implemented / Test Exists / Actually Tested

Example:

Diary Summary
Implemented = YES
Test Exists = YES
Actually Tested = PARTIAL

Reason:
The test checks only HTTP 200, not the aggregates.

---

# Reporting Rules

Each implementation phase requires:

`backend/docs/reports/PHASE{N}_REPORT.md`

Minimum report sections:

- Executive Summary
- Files Changed
- Database Changes
- API Changes
- Tests
- Risks
- Next Step

No implementation phase is complete without a report.

---

# Audit Rules

Audits must validate:

- code
- database
- runtime behavior
- OpenAPI
- tests

Audits must not rely solely on documentation.

Runtime verification is preferred over assumptions.

---

# Minimal Changes Rule

Changes must be minimal and focused on the task.

Do not refactor unrelated code, rename files, or move modules without explicit need.

Do not introduce speculative or future-proofing abstractions.

---

# Error Handling Rule

Do not swallow exceptions with empty `except` blocks.

Log errors explicitly and either propagate them or document the reason for suppression.

Prefer typed/expected exceptions over broad `Exception`.

---

# Dependencies Rule

Do not add new libraries or frameworks unless they are already used in the project or explicitly agreed.

Prefer the existing stack (FastAPI, SQLAlchemy async, Alembic, pytest, React, etc.).

---

# Async And Transactions Rule

When using `AsyncSession`:

- do not mix sync and async DB calls,
- commit/rollback only at the use-case boundary,
- do not store sessions in global state,
- avoid N+1 queries; use eager loading where needed.

---

# Idempotency Rule

For offline-sync and mutation endpoints, support an `idempotency_key` where applicable.

Retries must not create duplicate records.

---

# Clarification Rule

When requirements are ambiguous, ask one clarifying question with 2–5 options instead of guessing.

---

# API Versioning Rule

Backend contracts are versioned under `/api/v1`.

Do not break existing endpoints without a version bump and documentation update.

---

# Final Rule

Verify before changing.

Trust code over documentation.

Trust migrations over reports.

Trust OpenAPI over assumptions.

Never infer implementation status without verification.
