# FRONTEND_MAPPING.md

## Purpose

Client contract mapping for `frontend_dev` against SechHack backend (`/api/v1`).
No new backend business logic is introduced in Phase 21.

## Base URL

- Local: `http://localhost:3001`
- API prefix: `/api/v1`

## Auth / Roles

- Bearer JWT in `Authorization: Bearer <access_token>`
- Roles: `patient`, `doctor`, `psychologist`, `coordinator`, `clinic_admin`, `super_admin`

## Screen -> Endpoint Matrix (Frontend)

| Screen | Endpoint | Method | Request DTO | Response DTO | Role | Status |
|---|---|---|---|---|---|---|
| Login | /api/v1/auth/login | POST | LoginRequest | tokens + user | all | READY |
| Register phone | /api/v1/auth/sms/request | POST | SmsRequestModel | {status} | all | READY |
| Register SMS | /api/v1/auth/sms/verify | POST | SmsVerifyRequest | tokens + user | all | READY |
| Invite verify | /api/v1/auth/invite/verify | POST | InviteVerifyRequest | binding | doctor/clinic_admin | READY |
| Patient list | /api/v1/patients | GET | - | Patient[] | doctor/psychologist/coordinator | READY |
| Patient card | /api/v1/patients/{id} | GET | - | Patient | patient/doctor | READY |
| Patient update | /api/v1/patients/{id} | PATCH | PatientUpdate | Patient | patient/doctor | READY |
| Patient summary | /api/v1/patients/{id}/summary | GET | - | PatientSummary | all clinical | READY |
| Screening create | /api/v1/screenings | POST | ScreeningCreateRequest | ScreeningResult | patient/doctor | READY |
| Screening history | /api/v1/patients/{id}/screenings | GET | - | ScreeningResult[] | patient/doctor | READY |
| Questionnaire list | /api/v1/questionnaires | GET | - | Questionnaire[] | all | READY |
| Diagnosis list | /api/v1/diagnoses | GET | patient_id? | Diagnosis[] | patient/doctor/psychologist | READY |
| Diagnosis create | /api/v1/diagnoses | POST | DiagnosisCreate | Diagnosis | doctor/super_admin | READY |
| Assessment plans | /api/v1/assessment-plans | GET/POST | AssessmentPlanCreate | AssessmentPlan[] | patient/doctor | READY |
| Safety plans | /api/v1/safety/plans | GET/POST/PUT/DELETE | SafetyPlanCreate/Update | SafetyPlan | patient/doctor | READY |
| Crisis signals | /api/v1/safety/crisis-signals | GET/POST | CrisisSignalCreate | CrisisSignal[] | patient/doctor | READY |
| Diary list | /api/v1/diary | GET | patient_id?, date_from?, date_to? | DiaryEntry[] | patient/doctor | READY |
| Diary create | /api/v1/diary | POST | DiaryCreateRequest | DiaryEntry | patient | READY |
| Diary update | /api/v1/diary/{id} | PUT | DiaryUpdateRequest | DiaryEntry | patient | READY |
| Diary delete | /api/v1/diary/{id} | DELETE | - | 204 | patient | READY |
| Diary bulk sync | /api/v1/diary/bulk-sync | POST | DiaryBulkSyncRequest | DiaryBulkSyncResponse | patient | READY |
| Diary summary | /api/v1/diary/summary | GET | patient_id?, date_from?, date_to? | DiarySummaryResponse | patient/doctor | READY |

## Partial / Blocked

| Screen/Feature | Status | Reason |
|---|---|---|
| C-SSRS | BLOCKED | endpoint planned, not implemented |
| Medication skip | BLOCKED | endpoint planned, not implemented |
| Screening trend frontend charts | PARTIAL | endpoint exists, UI wiring pending |
| Mobile offline sync UI | PARTIAL | backend bulk-sync ready |