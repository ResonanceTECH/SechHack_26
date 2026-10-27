# API COVERAGE REPORT — Frontend Integration

## Backend Endpoints Used by Frontend (REAL API)

| Endpoint | Method | Frontend Screen | File | Status |
|----------|--------|----------------|------|--------|
| `/api/v1/auth/login` | POST | Login | `src/pages/login/LoginPage.tsx` | CONNECTED |
| `/api/v1/auth/refresh` | POST | (via api.ts retry) | `src/lib/api.ts` | CONNECTED (indirect) |
| `/api/v1/auth/logout` | POST | (via auth.ts) | `src/lib/auth.ts` | CONNECTED (indirect) |
| `/api/v1/auth/me` | GET | (via auth.ts) | `src/lib/auth.ts` | CONNECTED (indirect) |
| `/api/v1/auth/register` | POST | (via auth.ts) | `src/lib/auth.ts` | CONNECTED (indirect) |
| `/api/v1/auth/invite/verify` | POST | (via auth.ts) | `src/lib/auth.ts` | CONNECTED (indirect) |
| `/api/v1/auth/consent` | POST | (via auth.ts) | `src/lib/auth.ts` | CONNECTED (indirect) |
| `/api/v1/patients` | GET | Patients | `src/pages/patients/PatientsPage.tsx` | CONNECTED |
| `/api/v1/home/dashboard` | GET | Dashboard | `src/pages/dashboard/DashboardPage.tsx` | CONNECTED |

## Backend Endpoints Available but NOT Used by Frontend (92 total paths, 9 used)

All remaining ~83 backend endpoints are implemented but not yet called by any frontend screen. See `docs/CLIENT_MAPPING.md` section 4 for full matrix.

## Coverage Statistics

- Backend API paths: 92
- Paths called by frontend: 9
- Coverage: ~9.8%
- Frontend screens on REAL API: 3
- Frontend screens on MOCK: ~34
- Frontend screens UI ONLY: 0 (all have at least mock data)

## DTO Alignment

Frontend `src/types/api.ts` mirrors backend `app/schemas/`:
- `PatientListItem` ↔ `app/schemas/patient.py:PatientListItem` ✅
- `Envelope` ↔ `app/schemas/common.py:EnvelopeResponse` ✅
- `DashboardResponse` ↔ `GET /api/v1/home/dashboard` response shape ✅
- `AlertItem` ↔ alert schema from `GET /api/v1/home/dashboard` ✅
- `AppointmentItem` ↔ appointment schema from `GET /api/v1/home/dashboard` ✅