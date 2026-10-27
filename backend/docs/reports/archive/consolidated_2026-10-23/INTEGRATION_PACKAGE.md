# INTEGRATION_PACKAGE.md

## Base URL

- Local backend: `http://localhost:3001`
- API prefix: `/api/v1`
- Health: `GET /health`, `GET /db/health`, `GET /api/v1/health`

## Auth Flow

1. Register/login or SMS verify.
2. Receive `access_token` and `refresh_token`.
3. Send `Authorization: Bearer <access_token>` for protected endpoints.
4. Refresh via `POST /api/v1/auth/refresh`.
5. Logout via `POST /api/v1/auth/logout`.

## SMS Flow

1. `POST /api/v1/auth/sms/request` with phone.
2. `POST /api/v1/auth/sms/verify` with phone + code.
3. Receive JWT tokens.

## Invite Flow

1. Doctor creates invite code via `POST /api/v1/practitioners/{id}/invite-codes`.
2. Patient verifies via `POST /api/v1/auth/invite/verify` with Bearer token.

## JWT Flow

- Access token short-lived.
- Refresh token used to obtain new access token.
- Role is embedded in JWT claims.

## Patient Flow

1. SMS auth.
2. Load `/api/v1/patients/{id}/summary`.
3. Create diary entries `/api/v1/diary`.
4. Offline sync `/api/v1/diary/bulk-sync`.
5. Complete screenings `/api/v1/screenings`.
6. View diagnoses and assessment plans.

## Doctor Flow

1. Login.
2. List patients `/api/v1/patients`.
3. Open patient card and summary.
4. Create diagnoses and assessment plans.
5. Manage safety plans and crisis signals.

## Error Handling

- Standard envelope: `{data, meta, error}`.
- HTTP codes: 400, 401, 403, 404, 409, 422, 429.
- Validation errors return 422 with details in `error`.

## Seed Users / Test Accounts

- Patient user ID: `70f7a34f-f8df-49fc-a724-28f6d656c938`
- Patient profile ID: `705fa5d0-acfa-40e8-88d7-e4c516aa1048`
- Doctor user ID: `ba827169-c584-4186-a357-2e6a8bd8d04e`
- Psychologist user ID: `c3860428-8b82-494d-a617-cb2a546b649a`
- Coordinator user ID: `9efa3cfa-503f-46d2-8f41-61c22f4f2d10`

Tokens can be generated with `app.core.security.jwt.create_access_token`.

## OpenAPI Bundle

- `backend/docs/openapi_bundle.json`
- Source: FastAPI `/openapi.json`