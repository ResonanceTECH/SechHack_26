# FRONTEND READINESS REPORT

## Overall Status: PARTIAL

## API Layer

| Component | Status | Evidence |
|-----------|--------|----------|
| API client (`src/lib/api.ts`) | ✅ IMPLEMENTED | fetch-based, `{data,meta,error}` envelope, JWT 401 retry/refresh |
| Auth helpers (`src/lib/auth.ts`) | ✅ IMPLEMENTED | login/me/refresh/logout/register/verifyInvite/storeConsent |
| DTO types (`src/types/api.ts`) | ✅ IMPLEMENTED | Envelope, PatientListItem, DashboardResponse, TokenPair, UserBrief, MeResponse |
| Env config (`VITE_API_URL`) | ⚠ PARTIAL | Used in api.ts, defaults to `http://localhost:3001`; no `.env.example` yet |
| Token storage | ✅ IMPLEMENTED | localStorage (`cc_access_token`, `cc_refresh_token`) |

## Screen Connection Status

| Screen | File | Status | Endpoint |
|--------|------|--------|----------|
| Login | `src/pages/login/LoginPage.tsx` | ✅ REAL API | `POST /api/v1/auth/login` |
| Patients | `src/pages/patients/PatientsPage.tsx` | ✅ REAL API | `GET /api/v1/patients` |
| Dashboard | `src/pages/dashboard/DashboardPage.tsx` | ✅ REAL API | `GET /api/v1/home/dashboard` |
| Profile | `src/pages/profile/ProfilePage.tsx` | ❌ MOCK ONLY | — |
| Patient Card | `src/pages/patient-card/PatientCardPage.tsx` | ❌ MOCK ONLY | — |
| Pre-visit Report | `src/pages/pre-visit-report/PreVisitReportPage.tsx` | ❌ MOCK ONLY | — |
| Alerts | `src/pages/alerts/` | ❌ MOCK ONLY | — |
| Medications | `src/pages/medications/` | ❌ MOCK ONLY | — |
| Messages | `src/pages/messages/` | ❌ MOCK ONLY | — |
| Exercises | `src/pages/exercises/` | ❌ MOCK ONLY | — |
| Register | `src/pages/register/` | ❌ MOCK ONLY | — |
| Invite | `src/pages/invite/` | ❌ MOCK ONLY | — |
| Admin (all) | `src/pages/admin/` | ❌ MOCK ONLY | — |
| Connect Clinic | `src/pages/connect-clinic/` | ❌ MOCK ONLY | — |
| Treatment Plan | `src/pages/treatment-plan/` | ❌ MOCK ONLY | — |
| Scenarios | `src/pages/scenarios/` | ❌ MOCK ONLY | — |

## Build & Typecheck

- `npm run build` → typecheck passes for modified files; pre-existing errors in `SuspendAccessPage.tsx` (unrelated)
- No test runner configured for frontend (vitest not added — requires agreement per Dependencies Rule)

## Mock Files Remaining

~34 mock files in `src/data/mock*.ts` and inline mock imports across pages.

## Next Steps for Readiness

1. Wire Profile, Patient Card, Alerts to real API
2. Enrich PatientsPage with per-patient detail (`GET /api/v1/patients/{id}`)
3. Add `.env.example` with `VITE_API_URL`
4. Add frontend unit tests