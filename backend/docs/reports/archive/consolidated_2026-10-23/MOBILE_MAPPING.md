# MOBILE_MAPPING.md

## Purpose

Client contract mapping for `mobile_dev` against SechHack backend (`/api/v1`).
No new backend business logic is introduced in Phase 21.

## Base URL

- Local: `http://localhost:3001`
- API prefix: `/api/v1`

## Screen -> Endpoint Matrix (Mobile)

| Screen | Endpoint | Method | Request DTO | Response DTO | Role | Status |
|---|---|---|---|---|---|---|
| Welcome / Register phone | /api/v1/auth/sms/request | POST | SmsRequestModel | {status} | patient | READY |
| Register SMS | /api/v1/auth/sms/verify | POST | SmsVerifyRequest | tokens + user | patient | READY |
| Register doctor confirm | /api/v1/auth/invite/verify | POST | InviteVerifyRequest | binding | patient | READY |
| Home | /api/v1/patients/{id}/summary | GET | - | PatientSummary | patient | READY |
| Check-in mood | /api/v1/diary | POST | DiaryCreateRequest | DiaryEntry | patient | READY |
| Check-in anxiety | /api/v1/diary | POST | DiaryCreateRequest | DiaryEntry | patient | READY |
| Check-in sleep | /api/v1/diary | POST | DiaryCreateRequest | DiaryEntry | patient | READY |
| Diary list | /api/v1/diary | GET | date_from?, date_to? | DiaryEntry[] | patient | READY |
| Diary offline sync | /api/v1/diary/bulk-sync | POST | DiaryBulkSyncRequest | DiaryBulkSyncResponse | patient | READY |
| Questionnaires | /api/v1/questionnaires | GET | - | Questionnaire[] | patient | READY |
| Questionnaire detail | /api/v1/questionnaires/{code} | GET | version? | Questionnaire | patient | READY |
| Screening create | /api/v1/screenings | POST | ScreeningCreateRequest | ScreeningResult | patient | READY |
| Screening history | /api/v1/patients/{id}/screenings | GET | - | ScreeningResult[] | patient | READY |
| Safety plan | /api/v1/safety/plans | GET/POST/PUT/DELETE | SafetyPlanCreate/Update | SafetyPlan | patient | READY |
| Crisis signal | /api/v1/safety/crisis-signals | POST | CrisisSignalCreate | CrisisSignal | patient | READY |
| Diagnoses | /api/v1/patients/{id}/diagnoses | GET | - | Diagnosis[] | patient | READY |
| Assessment plans | /api/v1/assessment-plans | GET | patient_id? | AssessmentPlan[] | patient | READY |
| Patient card | /api/v1/patients/{id} | GET | - | Patient | patient | READY |

## Partial / Blocked

| Screen/Feature | Status | Reason |
|---|---|---|
| Medication tracking | BLOCKED | medication endpoints not implemented |
| Appointment scheduling | BLOCKED | appointment endpoints not implemented |
| Chat / messaging | BLOCKED | chat endpoints not implemented |
| Push notifications | PARTIAL | backend events planned, delivery pending |