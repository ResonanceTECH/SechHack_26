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

## Crisis/SOS сигналы (`/api/v1/crisis`) — ПЛАНИРУЕТСЯ

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| POST | `/signal` | Bearer, роль patient | `CrisisSignalCreate` | созданный сигнал; 401/422 |
| GET | `/signals` | Bearer, роли patient/doctor/psychologist/coordinator | — | список сигналов; 401 |
| GET | `/signals/{id}` | Bearer, роли patient/doctor/psychologist/coordinator | — | детальная карточка; 401/404 |
| PATCH | `/signals/{id}/acknowledge` | Bearer, роли doctor/psychologist | `{"status": "acknowledged"}` | обновлённый сигнал; 401/403/404 |
| PATCH | `/signals/{id}/resolve` | Bearer, роли doctor/psychologist | `{"status": "resolved"}` | обновлённый сигнал; 401/403/404 |

## План безопасности (`/api/v1/safety-plan`) — ПЛАНИРУЕТСЯ

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `` | Bearer, роли patient/doctor/psychologist | — | план безопасности пациента; 401/404 |
| POST | `` | Bearer, роли doctor/psychologist | `SafetyPlanCreate` | созданный план; 201/401/422 |

## Диагнозы МКБ-10 (`/api/v1/icd10`) — ПЛАНИРУЕТСЯ

| Метод | Путь | Авторизация | Запрос | Ответ / ошибки |
|---|---|---|---|---|
| GET | `` | Bearer, роли patient/doctor/psychologist | — | список диагнозов пациента; 401 |
| POST | `` | Bearer, роль doctor | `Icd10Create` | созданный диагноз; 201/401/422 |
| PUT | `/{id}` | Bearer, роль doctor | `Icd10Update` | обновлённый диагноз; 401/403/404/422 |

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
