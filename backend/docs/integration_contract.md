# Universal API Connector Contract (MIS / Emergency Services)

## Base
- Base path: `/api/v1/integrations`
- Content-Type: `application/json`
- Auth: Bearer token (OAuth2) or mTLS for service accounts
- All responses use standard envelope `{ data, meta, error }`

## Event model
`IntegrationEvent`:
- `id` (uuid)
- `source_system` (clinicalcompass | mis | emergency)
- `target_system` (mis | emergency | clinicalcompass)
- `event_type` (screening.result.created | alert.created | patient.updated)
- `entity_type` (screening_result | alert | patient)
- `entity_id` (uuid, optional)
- `idempotency_key` (string, unique)
- `status` (pending | sent | failed | dead_letter)
- `payload` (jsonb)
- `response` (jsonb, optional)
- `retry_count` (int)
- `next_retry_at` (datetime, optional)
- `created_at`, `updated_at`

## Endpoints (MVP)
- `POST /integrations/events`
  - Create outbound integration event.
- `GET /integrations/events/{id}`
  - Get event status.
- `POST /integrations/webhooks/{source}`
  - Receive inbound events from external systems.
- `GET /integrations/health`
  - Adapter health checks.

## FHIR mapping (MVP)
Screening result -> `Observation`:
- `code.text`: questionnaire code
- `valueInteger`: total score
- `interpretation.text`: severity label
- `subject.reference`: patient
- `effectiveDateTime`: recorded_at

## Retry policy
- Max retries: 5
- Backoff: 1m, 5m, 15m, 1h, 6h
- After max retries -> `dead_letter`
- Idempotency key prevents duplicate delivery

## Security
- Service-to-service auth via mTLS or OAuth2 client credentials
- Audit log for every inbound/outbound event
- No secrets in payload logs
"""