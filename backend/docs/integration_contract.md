# Universal API Connector Contract (MIS / Emergency Services)

## Base
- Base path: `/api/v1/integrations` (префикс API, зарегистрирован в `app/api/v1/router.py`)
- Content-Type: `application/json`
- Auth: Bearer JWT (access token) для защищённых эндпоинтов; mTLS или OAuth2 client credentials для service-to-service
- Все ответы используют стандартный конверт `{ data, meta, error }`
- Router: `app/api/v1/integrations.py` — регистрирует 6 эндпоинтов под префиксом `/api/v1/integrations`

## Event model
`IntegrationEvent` (модель `app/models/integration.py`, миграция `0012_integration_events`):

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | PK |
| `source_system` | String NOT NULL | `clinicalcompass` / `mis` / `emergency` |
| `target_system` | String NOT NULL | `mis` / `emergency` / `clinicalcompass` |
| `event_type` | String NOT NULL | `screening.result.created`, `alert.created`, `patient.updated` и т.д. |
| `entity_type` | String NOT NULL | `screening_result`, `alert`, `patient` |
| `entity_id` | UUID (nullable) | ID сущности |
| `idempotency_key` | String NOT NULL UNIQUE | Ключ идемпотентности (индекс `idx_integration_events_idempotency_key`) |
| `status` | String NOT NULL DEFAULT `pending` | `pending`, `sent`, `failed`, `dead_letter`, `received` |
| `payload` | JSONB NOT NULL DEFAULT `{}` | Полезная нагрузка |
| `response` | JSONB (nullable) | Ответ внешней системы |
| `retry_count` | Integer NOT NULL DEFAULT 0 | Количество попыток |
| `next_retry_at` | DateTime (nullable) | Время следующей попытки |
| `created_at` / `updated_at` | DateTime DEFAULT NOW() | Метки времени |

Индексы: `idx_integration_events_status_created_at`, `idx_integration_events_idempotency_key` (UNIQUE), `idx_integration_events_target_system`.

## Endpoints (реализовано)

| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| POST | `/api/v1/integrations/events` | Создать исходящее событие интеграции (с проверкой идемпотентности по `idempotency_key`) | Bearer JWT |
| GET | `/api/v1/integrations/events/{event_id}` | Получить событие по ID | Bearer JWT |
| POST | `/api/v1/integrations/webhooks/{source}` | Принять входящее веб-хук от внешней системы (источник из пути) | Bearer JWT |
| POST | `/api/v1/integrations/events/{event_id}/deliver` | Доставить событие (через `IntegrationDeliveryService`) | Bearer JWT |
| POST | `/api/v1/integrations/process-pending` | Обработать все pending-события | Bearer JWT |
| GET | `/api/v1/integrations/health` | Health-check адаптеров (MIS + Emergency) | нет |

### Логика создания события
1. Проверка существующего события по `idempotency_key` — если есть, возвращает существующее (идемпотентность).
2. Создание новой записи со статусом `pending`.
3. Ответ с данными события в стандартном конверте.

### Логика веб-хука
1. Ключ идемпотентности строится как `webhook:{source}:{event_type}:{entity_id or 'na'}`.
2. Проверка дубликата по ключу.
3. Создание события со статусом `received`, `target_system = 'clinicalcompass'`.

### Delivery
- `IntegrationDeliveryService().deliver(db, row)` — доставка одного события.
- `IntegrationDeliveryService().process_pending(db)` — обработка всех pending-событий.

## Integration adapters (реализовано)

### Base contract (`app/integrations/base.py`)
```python
class IntegrationAdapter(ABC):
    system_code: str
    async def pull_patient(self, external_id: str) -> IntegrationResult
    async def push_screening_result(self, patient_external_id: str, payload: dict) -> IntegrationResult
    async def push_alert(self, patient_external_id: str, payload: dict) -> IntegrationResult
    async def health_check(self) -> IntegrationResult
```

`IntegrationResult`: `ok` (bool), `status_code` (int|None), `payload` (dict|None), `error` (str|None).

### MISAdapter (`app/integrations/mis_adapter.py`)
- `system_code = "mis"`
- Использует `httpx.AsyncClient` для реальных HTTP-запросов к `MIS_BASE_URL`
- Методы: `pull_patient`, `push_screening_result`, `push_alert`, `health_check`
- Если `MIS_BASE_URL` не настроен — возвращает `ok=False` с ошибкой

### EmergencyServiceAdapter (`app/integrations/emergency_adapter.py`)
- `system_code = "emergency"`
- Использует `httpx.AsyncClient` для реальных HTTP-запросов к `EMERGENCY_BASE_URL`
- Методы: `pull_patient`, `push_screening_result`, `push_alert`, `health_check`
- Если `EMERGENCY_BASE_URL` не настроен — возвращает `ok=False` с ошибкой

### Переменные окружения (`.env.example`)
| Переменная | Описание |
|------------|----------|
| `MIS_BASE_URL` | Базовый URL МИС |
| `MIS_API_TOKEN` | Токен для МИС |
| `EMERGENCY_BASE_URL` | Базовый URL службы неотложной помощи |
| `EMERGENCY_API_TOKEN` | Токен для службы неотложной помощи |

## FHIR mapping (MVP)

Функция `screening_result_to_fhir_observation` в `app/integrations/fhir_mapper.py` строит миниатюрный FHIR R4 `Observation` из результата скрининга:

| Поле FHIR | Источник |
|-----------|----------|
| `resourceType` | `"Observation"` |
| `status` | `"final"` |
| `category` | `survey` (HL7 observation-category) |
| `code.text` | questionnaire code (например `phq9`) |
| `subject.reference` | patient reference |
| `effectiveDateTime` | `recorded_at` |
| `valueInteger` | total score |
| `interpretation[].text` | severity label |

## Retry policy

| Параметр | Значение |
|----------|----------|
| Максимум попыток | 5 |
| Backoff | 1м, 5м, 15м, 1ч, 6ч |
| После максимума | статус `dead_letter` |
| Idempotency key | предотвращает дублирование доставки |

## Security

- Service-to-service auth via mTLS или OAuth2 client credentials
- Audit log для каждого inbound/outbound события
- Нет секретов в логах payload
- Все эндпоинты защищены Bearer JWT (кроме `/health`)
- Адаптеры используют токены из переменных окружения (`MIS_API_TOKEN`, `EMERGENCY_API_TOKEN`)
