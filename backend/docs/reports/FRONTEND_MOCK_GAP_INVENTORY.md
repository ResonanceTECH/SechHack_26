# Frontend Mock-Data Gap Inventory & Verification

Date: 2026-10-27

## Verification (real commands, real results)

- Backend pytest: 164 passed, 3 warnings (SechHack_26/backend)
- Frontend build (tsc -b && vite build): PASS (6226 modules, built 1.42s)
- Frontend lint (oxlint): 0 errors, 20 warnings
- Mobile tsc --noEmit: PASS (no errors)

## Frontend mock-data inventory

Files under src/data/mock*.ts: 37 modules.
Pages/components referencing 'mock' (string match): 31 files (see list below).

Most of these pages do NOT import a shared mock module; they contain inline/local mock data or call helpers from src/data/mock*.ts. The shared mock modules are consumed almost exclusively by PreVisitReportPage (mockDiary, mockPatientCard) plus the MedicationsPage (findMedications from mockMedications, a GRLS reference drug search).

## Top mock-referencing files

- src/data/mockDiary.ts
- src/data/mockPatientCard.ts
- src/lib/auth.ts
- src/components/admin/*, src/components/InvitePatientModal/*, src/components/RequestQuestionnaireModal/*, src/components/sidebar/Sidebar.tsx
- src/pages/admin/* (18 pages)
- src/pages/alerts/AdverseEventAlertPage.tsx
- src/pages/exercises/ExercisesPage.tsx
- src/pages/medications/MedicationsPage.tsx
- src/pages/pre-visit-report/PreVisitReportPage.tsx
- src/pages/pre-visit-reports/PreVisitReportsPage.tsx
- src/pages/profile/ProfilePage.tsx
- src/pages/scenarios/ScenariosPage.tsx
- src/pages/treatment-plan/TreatmentPlanPage.tsx

## Backend capability available for wiring

Backend exposes routers for: auth, practitioners, patients, screenings, questionnaires, alerts, diagnoses, assessment_plans, safety, diary, integrations, medications (incl. prescriptions, adherence), exercises, messages, appointments, reports, admin, audit, schedule, assignments, users, home, qr, versions.

A fetch-based API client already exists at src/lib/api.ts (envelope-aware, JWT refresh, 401 retry). No new dependency required.

## Conclusion / next steps

Full removal of all mock data requires per-page wiring to the endpoints above. This is a multi-iteration effort; the highest-value first slice is:

1. PreVisitReportPage: replace mockDiary/mockPatientCard with /api/v1/reports + /api/v1/diary endpoints.
2. Patient card diary tab: wire to /api/v1/diary (today + list + summary).
3. Messages pages: wire to /api/v1/messages (both doctor and patient directions).
4. Alerts pages: wire to /api/v1/alerts.
5. Admin pages: wire to /api/v1/admin + /api/v1/audit.

Until those are done, status for the affected screens remains MOCK ONLY / PARTIAL. Backend, build and typecheck are green.
