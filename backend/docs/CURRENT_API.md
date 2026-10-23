# Текущий реализованный API (MVP)

Документ описывает только реально зарегистрированные эндпоинты FastAPI-приложения.

Базовый URL: `http://localhost:3001`

Авторизация: Bearer JWT (`Authorization: Bearer <access_token>`), если не указано иное.

Единый конверт ответа: `{"data": ..., "meta": {"request_id", "timestamp"}, "error": null|{...}}`.

## Health

| Метод | Путь | Авторизация | Ответ |
|---|---|---|---|
| GET | `/health` | нет | `{"ok": true}` |
| GET | `/db/health` | нет | `{"ok": true, "now": ..., "db": ...}` |
| GET | `/api/v1/health` | нет | конверт `{"status": "healthy"}` |

## Auth (`/api/v1/auth`)

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| POST | `/register` | нет | `RegisterRequest` | 201 токены; 400/409/422 |
| POST | `/login` | нет | `LoginRequest` | токены; 401/422/429 |
| POST | `/sms/request` | нет | `SmsRequestModel` | `{"status":"sent"}`; 422 |
| POST | `/sms/verify` | нет | `SmsVerifyRequest` | токены; 401/422 |
| POST | `/invite/verify` | Bearer | `InviteVerifyRequest` | привязка; 401/404/422 |
| POST | `/refresh` | нет | `RefreshRequest` | токены; 401/422 |
| POST | `/logout` | Bearer | `LogoutRequest` | `{"logged_out":true}`; 401/422 |
| GET | `/me` | Bearer | — | профиль; 401 |
| POST | `/change-password` | Bearer | `ChangePasswordRequest` | `{"changed":true}`; 401/422 |

## Screening (`/api/v1/screenings`)

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `` | Bearer | `questionnaire_code`, `version` (query, optional) | список опросников; 401/404 |
| POST | `` | Bearer | `ScreeningCreateRequest` | результат скрининга; 401/404/422 |
| GET | `/{screening_id}` | Bearer | — | результат скрининга; 401/404 |

## Patient screenings (`/api/v1/patients/{patient_id}/screenings`)

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `` | Bearer | — | история скринингов пациента; 401/404 |

## Questionnaires (`/api/v1/questionnaires`)

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `` | Bearer | — | список активных опросников; 401 |
| GET | `/{code}` | Bearer | `version` (query, optional) | опросник по коду; 401/404 |
| GET | `/{code}/versions/{version}` | Bearer | — | версия опросника; 401/404 |

## Practitioners (`/api/v1/practitioners`)

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `/{practitioner_id}/invite-codes` | Bearer, роли doctor/clinic_admin | — | список кодов; 401/403/404 |
| POST | `/{practitioner_id}/invite-codes` | Bearer, роли doctor/clinic_admin | `InviteCodeCreateRequest` | код; 401/403/404/422 |

## Patients (`/api/v1/patients`)

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `` | Bearer | — | список пациентов; 401 |
| GET | `/{patient_id}` | Bearer | — | карточка; 401/404 |
| PATCH | `/{patient_id}` | Bearer | `PatientUpdate` | обновлённая карточка; 401/404/422 |
| GET | `/{patient_id}/summary` | Bearer | — | сокращённая карточка; 401/404 |
| GET | `/{patient_id}/screening-trend` | Bearer | — | standalone screening trend; 401/404 |
| GET | `/{patient_id}/diagnoses` | Bearer | — | список диагнозов пациента; 401/403/404 |

## Safety (`/api/v1/safety`) — РЕАЛИЗОВАНО

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `/plans` | Bearer | — | список safety plans; 401 |
| POST | `/plans` | Bearer, `safety:write` | `SafetyPlanCreate` | созданный план; 201/401/422 |
| GET | `/plans/{plan_id}` | Bearer | — | план; 401/404 |
| PUT | `/plans/{plan_id}` | Bearer, `safety:write` | `SafetyPlanUpdate` | обновлённый план; 401/404/422 |
| DELETE | `/plans/{plan_id}` | Bearer, `safety:write` | — | 204/401/404 |
| GET | `/crisis-signals` | Bearer | — | список crisis signals; 401 |
| POST | `/crisis-signals` | Bearer | `CrisisSignalCreate` | созданный сигнал; 201/401/422 |
| POST | `/crisis-signals/{signal_id}/acknowledge` | Bearer | — | обновлённый сигнал; 401/404 |

## План безопасности (`/api/v1/safety-plan`) — ОТСУТСТВУЕТ

Отдельного `/api/v1/safety-plan` endpoint нет. Safety plans реализованы через `/api/v1/safety/plans`.

## Диагнозы (`/api/v1/diagnoses`) — РЕАЛИЗОВАНО

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `` | Bearer, роли patient/doctor/psychologist | `patient_id` (query, optional) | список диагнозов; 401/403 |
| POST | `` | Bearer, роли doctor/super_admin | `DiagnosisCreate` | созданный диагноз; 201/401/403/422 |
| GET | `/{id}` | Bearer, роли patient/doctor/psychologist | — | диагноз; 401/403/404 |
| PUT | `/{id}` | Bearer, роли doctor/super_admin | `DiagnosisUpdate` | обновлённый диагноз; 401/403/404/422 |

## Диагнозы пациента (`/api/v1/patients/{patient_id}/diagnoses`) — РЕАЛИЗОВАНО

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `` | Bearer, роли patient/doctor/psychologist | — | список диагнозов пациента; 401/403/404 |


Поддержка МКБ-10 и МКБ-11 одновременно: поле `coding_system` (`ICD10`/`ICD11`). Patient Card summary включает диагнозы.

Deprecated alias: `/api/v1/icd10` реализован как deprecated alias `/api/v1/diagnoses?coding_system=ICD10` (Phase 14).

## Планы оценок (MBC) (`/api/v1/assessment-plans`) — РЕАЛИЗОВАНО

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `` | Bearer, роли patient/doctor/psychologist | `patient_id` (query, optional) | список планов; 401/403 |
| POST | `` | Bearer, роли doctor/super_admin | `AssessmentPlanCreate` | созданный план; 201/401/403/422 |
| GET | `/{id}` | Bearer, роли patient/doctor/psychologist | — | план; 401/403/404 |
| PUT | `/{id}` | Bearer, роли doctor/super_admin | `AssessmentPlanUpdate` | обновлённый план; 401/403/404/422 |
| DELETE | `/{id}` | Bearer, роли doctor/super_admin | — | 204/401/403/404 |

Планы связывают диагноз → опросник (PHQ-9, GAD-7 и др. из реестра) → расписание → результаты скринингов → тренды. Patient Card summary включает активные планы, ближайший срок и просроченные.

## C-SSRS оценка суицидального риска (`/api/v1/cssrs`) — ПЛАНИРУЕТСЯ

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `` | Bearer, роли patient/doctor/psychologist | — | список оценок пациента; 401 |
| POST | `` | Bearer, роли doctor/psychologist | `CssrsAssessmentCreate` | результаты оценки; 201/401/422 |

## Пропуск приёма лекарства (`/api/v1/medications/{id}/skip`) — ПЛАНИРУЕТСЯ

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| POST | `/{medication_id}/skip` | Bearer, роли patient/doctor | `MedicationSkipCreate` | запись о пропуске; 201/401/404/422 |

| GET | `/{patient_id}/summary` | Bearer | — | сокращённая карточка; 401/404 |
