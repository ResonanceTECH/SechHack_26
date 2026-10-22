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
