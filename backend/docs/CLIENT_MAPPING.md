# CLIENT_MAPPING.md — Контракты клиентов (мобилка + фронтенд + интеграции)

**Объединяет:** MOBILE_MAPPING.md, FRONTEND_MAPPING.md, INTEGRATION_PACKAGE.md  
**Базовый URL:** `http://localhost:3001`  
**Префикс API:** `/api/v1`  
**Конверт ответа:** `{"data": ..., "meta": {"request_id", "timestamp"}, "error": null|{...}}`  
**Аутентификация:** Bearer JWT (`Authorization: Bearer <access_token>`)

---

## 1. Auth Flow (общий для обоих клиентов)

1. Register/login или SMS verify → получаем `access_token` и `refresh_token`.
2. Для защищённых эндпоинтов отправляем `Authorization: Bearer <access_token>`.
3. Refresh через `POST /api/v1/auth/refresh`.
4. Logout через `POST /api/v1/auth/logout`.

### SMS Flow

1. `POST /api/v1/auth/sms/request` с телефоном.
2. `POST /api/v1/auth/sms/verify` с телефоном + кодом.
3. Получаем JWT токены.

### Invite Flow

1. Врач создаёт invite-код через `POST /api/v1/practitioners/{id}/invite-codes`.
2. Пациент подтверждает через `POST /api/v1/auth/invite/verify` с Bearer токеном.
3. QR: мобилка сканирует QR (`QrScanScreen`) и извлекает invite-код клиентом (`extractInviteCode`), затем вызывает тот же эндпоинт — отдельного API для QR нет.
4. Skip: пациент может завершить регистрацию без привязки (`onSkip`); повторный вызов `/auth/invite/verify` с обычным JWT привязывает врача позже.

### JWT Flow

- Access token короткоживущий (15 мин).
- Refresh token используется для получения нового access токена (7 дней).
- Роль встроена в claims JWT.

---

## 2. Seed Users / Test Accounts

| Роль | User ID | Profile ID |
|------|---------|------------|
| Patient | `70f7a34f-f8df-49fc-a724-28f6d656c938` | `705fa5d0-acfa-40e8-88d7-e4c516aa1048` |
| Doctor | `ba827169-c584-4186-a357-2e6a8bd8d04e` | — |
| Psychologist | `c3860428-8b82-494d-a617-cb2a546b649a` | — |
| Coordinator | `9efa3cfa-503f-46d2-8f41-61c22f4f2d10` | — |

## 3. Screen → Endpoint Matrix (Mobile — mobile_dev)

| Screen | Endpoint | Method | Request DTO | Response DTO | Role | Status |
|--------|----------|--------|-------------|--------------|------|--------|
| Welcome / Register phone | `/api/v1/auth/sms/request` | POST | `SmsRequestModel` | `{status}` | patient | READY |
| Register SMS | `/api/v1/auth/sms/verify` | POST | `SmsVerifyRequest` | tokens + user | patient | READY |
| Register doctor confirm | `/api/v1/auth/invite/verify` | POST | `InviteVerifyRequest` | binding | patient | READY |
| Home | `/api/v1/patients/{id}/summary` | GET | — | `PatientSummary` | patient | READY |
| Check-in mood | `/api/v1/diary` | POST | `DiaryCreateRequest` | `DiaryEntry` | patient | READY |
| Check-in anxiety | `/api/v1/diary` | POST | `DiaryCreateRequest` | `DiaryEntry` | patient | READY |
| Check-in sleep | `/api/v1/diary` | POST | `DiaryCreateRequest` | `DiaryEntry` | patient | READY |
| Diary list | `/api/v1/diary` | GET | `date_from?`, `date_to?` | `DiaryEntry[]` | patient | READY |
| Diary offline sync | `/api/v1/diary/bulk-sync` | POST | `DiaryBulkSyncRequest` | `DiaryBulkSyncResponse` | patient | READY |
| Questionnaires | `/api/v1/questionnaires` | GET | — | `Questionnaire[]` | patient | READY |
| Questionnaire detail | `/api/v1/questionnaires/{code}` | GET | `version?` | `Questionnaire` | patient | READY |
| Screening create | `/api/v1/screenings` | POST | `ScreeningCreateRequest` | `ScreeningResult` | patient | READY |
| Screening history | `/api/v1/patients/{id}/screenings` | GET | — | `ScreeningResult[]` | patient | READY |
| Safety plan | `/api/v1/safety/plans` | GET/POST/PUT/DELETE | `SafetyPlanCreate/Update` | `SafetyPlan` | patient | READY |
| Crisis signal | `/api/v1/safety/crisis-signals` | POST | `CrisisSignalCreate` | `CrisisSignal` | patient | READY |
| Diagnoses | `/api/v1/patients/{id}/diagnoses` | GET | — | `Diagnosis[]` | patient | READY |
| Assessment plans | `/api/v1/assessment-plans` | GET | `patient_id?` | `AssessmentPlan[]` | patient | READY |
| Patient card | `/api/v1/patients/{id}` | GET | — | `Patient` | patient | READY |

### Partial / Blocked (Mobile)

| Screen/Feature | Status | Reason |
|----------------|--------|--------|
| Medication tracking | READY | `/api/v1/medications` (GET), `/api/v1/medications/{id}` (GET) |
| Appointment scheduling | READY | `/api/v1/appointments` (GET/POST) |
| Reports (pre-visit, clinic analytics) | READY | `/api/v1/reports/pre-visit/{patient_id}` (GET), `/api/v1/reports/clinic-analytics` (GET) |
| Admin staff management | READY | `/api/v1/admin/staff` (GET), `/api/v1/admin/staff/{id}/role` (PATCH) |
| Audit logs | READY | `/api/v1/audit/logs` (GET) |

## 4. Screen → Endpoint Matrix (Frontend — frontend_dev)

| Screen | Endpoint | Method | Request DTO | Response DTO | Role | Status |
|--------|----------|--------|-------------|--------------|------|--------|
| Login | `/api/v1/auth/login` | POST | `LoginRequest` | tokens + user | all | READY |
| Register phone | `/api/v1/auth/sms/request` | POST | `SmsRequestModel` | `{status}` | all | READY |
| Register SMS | `/api/v1/auth/sms/verify` | POST | `SmsVerifyRequest` | tokens + user | all | READY |
| Invite verify | `/api/v1/auth/invite/verify` | POST | `InviteVerifyRequest` | binding | doctor/clinic_admin | READY |
| Patient list | `/api/v1/patients` | GET | — | `Patient[]` | doctor/psychologist/coordinator | READY |
| Patient card | `/api/v1/patients/{id}` | GET | — | `Patient` | patient/doctor | READY |
| Patient update | `/api/v1/patients/{id}` | PATCH | `PatientUpdate` | `Patient` | patient/doctor | READY |
| Patient summary | `/api/v1/patients/{id}/summary` | GET | — | `PatientSummary` | all clinical | READY |
| Screening create | `/api/v1/screenings` | POST | `ScreeningCreateRequest` | `ScreeningResult` | patient/doctor | READY |
| Screening history | `/api/v1/patients/{id}/screenings` | GET | — | `ScreeningResult[]` | patient/doctor | READY |
| Questionnaire list | `/api/v1/questionnaires` | GET | — | `Questionnaire[]` | all | READY |
| Diagnosis list | `/api/v1/diagnoses` | GET | `patient_id?` | `Diagnosis[]` | patient/doctor/psychologist | READY |
| Diagnosis create | `/api/v1/diagnoses` | POST | `DiagnosisCreate` | `Diagnosis` | doctor/super_admin | READY |
| Assessment plans | `/api/v1/assessment-plans` | GET/POST | `AssessmentPlanCreate` | `AssessmentPlan[]` | patient/doctor | READY |
| Safety plans | `/api/v1/safety/plans` | GET/POST/PUT/DELETE | `SafetyPlanCreate/Update` | `SafetyPlan` | patient/doctor | READY |
| Crisis signals | `/api/v1/safety/crisis-signals` | GET/POST | `CrisisSignalCreate` | `CrisisSignal[]` | patient/doctor | READY |
| Diary list | `/api/v1/diary` | GET | `patient_id?`, `date_from?`, `date_to?` | `DiaryEntry[]` | patient/doctor | READY |
| Diary create | `/api/v1/diary` | POST | `DiaryCreateRequest` | `DiaryEntry` | patient | READY |
| Diary update | `/api/v1/diary/{id}` | PUT | `DiaryUpdateRequest` | `DiaryEntry` | patient | READY |
| Diary delete | `/api/v1/diary/{id}` | DELETE | — | 204 | patient | READY |
| Diary bulk sync | `/api/v1/diary/bulk-sync` | POST | `DiaryBulkSyncRequest` | `DiaryBulkSyncResponse` | patient | READY |
| Diary summary | `/api/v1/diary/summary` | GET | `patient_id?`, `date_from?`, `date_to?` | `DiarySummaryResponse` | patient/doctor | READY |
| Care plans list | `/api/v1/care-plans` | GET | `patient_id?` | `CarePlan[]` | patient/doctor/psychologist | READY |
| Care plan create | `/api/v1/care-plans` | POST | `CarePlanCreate` | `CarePlan` | doctor/psychologist | READY |
| Exercise list | `/api/v1/exercises` | GET | `patient_id?` | `ExerciseAssignment[]` | patient/doctor/psychologist | READY |
| Exercise create | `/api/v1/exercises` | POST | `ExerciseAssignmentCreate` | `ExerciseAssignment` | doctor/psychologist | READY |
| Exercise update | `/api/v1/exercises/{id}` | PUT | `ExerciseAssignmentUpdate` | `ExerciseAssignment` | doctor/psychologist | READY |
| Exercise complete | `/api/v1/exercises/{id}/complete` | POST | `ExerciseCompletionCreate` | `ExerciseCompletion` | patient | READY |
| Exercise compliance | `/api/v1/exercises/{id}/compliance` | GET | — | `ComplianceResponse` | doctor/psychologist | READY |

### Partial / Blocked (Frontend)

| Screen/Feature | Status | Reason |
|----------------|--------|--------|
| C-SSRS | BLOCKED | endpoint planned, not implemented |
| Medication skip | READY | `/api/v1/adherence` (GET/POST/PATCH), `/api/v1/prescriptions/{id}/adherence-rate` (GET) |
| Screening trend frontend charts | PARTIAL | endpoint exists, UI wiring pending |
| Mobile offline sync UI | PARTIAL | backend bulk-sync ready |
| Chat / messaging | PARTIAL | `/api/v1/messages` (list/create/read-state), SLA availability `/api/v1/messages/sla/{practitioner_id}` (GET) |
| Push notifications | PARTIAL | backend events planned, delivery pending |

## 4.5 Schedule / Availability (Planned)

Чат остаётся доступным 24/7; расписание влияет только на UX-индикаторы и SLA.

| Endpoint | Method | Request | Response | Role | Status |
|----------|--------|---------|----------|------|--------|
| `/api/v1/clinics/{clinic_id}/settings` | GET | — | `ClinicSettings` | все роли | PLANNED |
| `/api/v1/clinics/{clinic_id}/settings` | PUT | `ClinicSettingsUpdate` | `ClinicSettings` | clinic_admin, super_admin | PLANNED |
| `/api/v1/practitioners/{id}/schedule` | GET | — | `PractitionerScheduleResponse` | все роли | PLANNED |
| `/api/v1/practitioners/{id}/schedule` | PUT | `PractitionerScheduleReplace` | `PractitionerScheduleResponse` | doctor, clinic_admin, super_admin | PLANNED |
| `/api/v1/practitioners/{id}/schedule/exceptions` | POST | `ScheduleExceptionCreate` | `ScheduleException` | doctor, clinic_admin, super_admin | PLANNED |
| `/api/v1/practitioners/{id}/schedule/exceptions/{exception_id}` | DELETE | — | 204 | doctor, clinic_admin, super_admin | PLANNED |
| `/api/v1/practitioners/{id}/availability` | GET | `at?` | `{timezone, is_available_now, next_available_at}` | все роли | PLANNED |

## 4.6 Partial / Blocked (Frontend)

| Screen/Feature | Status | Reason |
|----------------|--------|--------|
| Clinic settings timezone | PARTIAL | backend `GET/PUT /api/v1/clinics/{id}/settings` implemented; frontend mock |
| Doctor schedule / availability | PARTIAL | backend `GET/PUT /api/v1/practitioners/{id}/schedule`, exceptions implemented; availability calc planned |

## 5. Patient Flow (общий)

1. SMS auth.
2. Загрузить `/api/v1/patients/{id}/summary`.
3. Создать записи дневника `/api/v1/diary`.
4. Офлайн-синхронизация `/api/v1/diary/bulk-sync`.
5. Пройти скрининги `/api/v1/screenings`.
6. Посмотреть диагнозы и планы оценок.

## 6. Doctor Flow (общий)

1. Login.
2. Список пациентов `/api/v1/patients`.
3. Открыть карточку пациента и summary.
4. Создать диагнозы и планы оценок.
5. Управлять планами безопасности и кризисными сигналами.
6. Управлять назначениями пациентов `/api/v1/assignments` (create/list/deactivate).

## 7. Error Handling (общий)

- Стандартный конверт: `{data, meta, error}`.
- HTTP коды: 400, 401, 403, 404, 409, 422, 429.
- Ошибки валидации возвращают 422 с деталями в `error`.
- Коды `error.code`: `unauthorized`, `forbidden`, `invalid_credentials`, `not_found`, `validation_error`, `rate_limited`, `conflict`, `internal_error`.

## 8. OpenAPI

- `docs/openapi.json`
- Источник: FastAPI `/openapi.json`
- 71 путей (актуальное состояние runtime, совпадает с committed spec)

Токены можно сгенерировать с помощью `app.core.security.jwt.create_access_token`.


## Questionnaire anchors

См. [questionnaire_sources](./questionnaire_sources.md) (раздел «Формулировки ответов»): `anchors` присутствуют для PDSS/ISI; YMRS использует только числовые метки.
