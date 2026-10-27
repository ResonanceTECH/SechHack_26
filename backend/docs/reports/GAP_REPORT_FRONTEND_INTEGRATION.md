# GAP REPORT — Frontend Integration (Post-PHASE62/PHASE63)

## Executive Summary

После подключения 3 экранов к реальному API остаётся ~34 mock-файла на фронтенде и 8 мок-экранов в мобильном приложении. Backend контракты покрывают ~95% экранов Figma (45 mobile + 60 web). Основной пробел — клиентская интеграция: замена mock-данных на реальные вызовы.

## User Journey Gaps

### Patient Journey (Mobile) — 5/11 шагов не подключены

| Шаг | Экран | Статус | Нужен endpoint |
|-----|-------|--------|----------------|
| Home | HomeScreen | MOCK ONLY | GET /api/v1/patients/{id}/summary |
| Diary listing | DiaryScreen | MOCK ONLY | GET /api/v1/diary |
| Symptoms | SymptomSelectScreen | MOCK ONLY | — (нет подходящего endpoint) |
| Medication dosing | MedicationScreen | MOCK ONLY | — (нет подходящего endpoint) |
| Messages | ChatScreen | MOCK ONLY | GET /api/v1/messages |
| Alerts | NotificationsScreen | MOCK ONLY | GET /api/v1/notifications |
| Alerts (emergency) | EmergencyHelpScreen | UI ONLY | — |

### Doctor Journey (Frontend) — 7/10 шагов не подключены

| Шаг | Экран | Статус | Нужен endpoint |
|-----|-------|--------|----------------|
| Patient Card | PatientCardPage | MOCK ONLY | GET /api/v1/patients/{id}/card |
| Assessment | Нет экрана | UNVERIFIED | — |
| Diagnosis | Нет экрана | UNVERIFIED | — |
| Care Plan | TreatmentPlanPage | MOCK ONLY | GET /api/v1/care-plans |
| Medication Review | MedicationsPage | MOCK ONLY | GET /api/v1/medications/* |
| Alert Review | AlertsPage | MOCK ONLY | GET /api/v1/alerts |
| Reports | PreVisitReportsPage | MOCK ONLY | GET /api/v1/reports/* |

### Admin Journey (Frontend) — 5/5 шагов не подключены

| Шаг | Экран | Статус | Нужен endpoint |
|-----|-------|--------|----------------|
| Login | AdminLogin2faPage | MOCK ONLY | — (требуется реальная аутентификация) |
| Staff | EmployeesPage | MOCK ONLY | GET /api/v1/clinics/{id}/members |
| Roles | RolesAccessPage | MOCK ONLY | GET /api/v1/clinics/{id}/members |
| Audit | AuditPage | MOCK ONLY | GET /api/v1/audit/* |
| Settings | SettingsPage | MOCK ONLY | GET /api/v1/clinics/{id}/settings |

## Remaining Gaps by Screen (Detailed)

### Frontend screens still on MOCK ONLY (14 screens)

| # | Screen | Mock Data Source | Needed Endpoint(s) | Priority |
|---|--------|-----------------|-------------------|----------|
| 1 | `src/pages/profile/ProfilePage.tsx` | `@/data/mockDoctor` (`doctorProfile`) | `GET /api/v1/users/me`, `GET /api/v1/practitioners/{id}` | High |
| 2 | `src/pages/patient-card/PatientCardPage.tsx` | 6 mock imports | `GET /api/v1/patients/{id}`, `/card`, `/summary` | Critical |
| 3 | `src/pages/alerts/AlertsPage.tsx` | `@/data/mockAlerts` | `GET /api/v1/alerts` | High |
| 4 | `src/pages/medications/MedicationsPage.tsx` | `@/data/mockMedications` | `GET /api/v1/medications/*` | High |
| 5 | `src/pages/messages/MessagesPage.tsx` | `@/data/mockMessages` | `GET /api/v1/messages` | Medium |
| 6 | `src/pages/exercises/ExercisesPage.tsx` | `@/data/mockExercises`, `@/data/mockPatients` | `GET /api/v1/exercises` | Medium |
| 7 | `src/pages/treatment-plan/TreatmentPlanPage.tsx` | `@/data/mockTreatmentPlan` | `GET /api/v1/care-plans` | High |
| 8 | `src/pages/pre-visit-report/PreVisitReportPage.tsx` | 3 mock imports | `GET /api/v1/reports/*` | Medium |
| 9 | `src/pages/pre-visit-reports/PreVisitReportsPage.tsx` | `@/data/mockPreVisitReports` | `GET /api/v1/reports/*` | Medium |
| 10 | `src/pages/admin/employees/EmployeesPage.tsx` | `@/data/mockAdmin` | `GET /api/v1/clinics/{id}/members` | Medium |
| 11 | `src/pages/admin/roles/RolesAccessPage.tsx` | `@/data/mockRolesAccess` | `GET /api/v1/clinics/{id}/members` | Medium |
| 12 | `src/pages/admin/audit/AuditPage.tsx` | `@/data/mockAccessInviteLog` | `GET /api/v1/audit/*` | Medium |
| 13 | `src/pages/admin/settings/SettingsPage.tsx` | `@/data/mockSettings` | `GET /api/v1/clinics/{id}/settings` | Low |
| 14 | `src/pages/admin/analytics/AnalyticsPage.tsx` | `@/data/mockAnalytics` | `GET /api/v1/analytics/*` | Low |

### Mobile screens on MOCK ONLY (8 screens)

| # | Screen | Issue | Needed Endpoint | Priority |
|---|--------|-------|----------------|----------|
| 1 | `src/screens/HomeScreen.tsx` | Локальные данные, нет API | `GET /api/v1/patients/{id}/summary` | High |
| 2 | `src/screens/DiaryScreen.tsx` | Хардкод MOOD/ANXIETY массивов | `GET /api/v1/diary` | High |
| 3 | `src/screens/MedicationScreen.tsx` | Локальное состояние dosis, нет API | — | Medium |
| 4 | `src/screens/ChatScreen.tsx` | Локальное состояние, нет API | `GET /api/v1/messages` | Medium |
| 5 | `src/screens/NotificationsScreen.tsx` | Хардкод уведомлений | `GET /api/v1/notifications` | Low |
| 6 | `src/screens/SymptomSelectScreen.tsx` | Локальный выбор, нет API | — | Low |
| 7 | `src/screens/SymptomDetailScreen.tsx` | Только навигация, нет API | — | Low |
| 8 | `src/screens/EmergencyHelpScreen.tsx` | Нет API | — | Low |

## Closed Gaps (PHASE62)

| Gap | Before | After |
|-----|--------|-------|
| No API client layer | Absent | `src/lib/api.ts` (fetch + JWT retry/refresh) |
| No auth layer | `doctorAuth.ts` mock | `src/lib/auth.ts` (login/me/refresh/logout/register/verifyInvite/storeConsent) |
| No DTO types | — | `src/types/api.ts` (Envelope, PatientListItem, DashboardResponse, etc.) |
| Login on mock | `kk-doctor-auth` localStorage flag | `POST /api/v1/auth/login` with JWT tokens |
| Patients list on mock | `src/data/mockPatients.ts` | `GET /api/v1/patients` |
| Dashboard on mock | `src/data/mockDoctor.ts` | `GET /api/v1/home/dashboard` |

## Verification Method

All gaps verified against source code (not documentation):
- Searched `frontend_dev/frontend/src/` for `mockDoctor`, `mockPatients`, `mock*` imports
- Searched `mobile_dev/mobile/src/screens/` for API imports — screens don't import API directly, wired through App.tsx
- Verified backend endpoints exist in `SechHack_26/backend/app/api/v1/`
- Confirmed OpenAPI paths via `GET /openapi.json` (92 paths)