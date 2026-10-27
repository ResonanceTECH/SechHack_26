# PHASE 16 REPORT — SymptomTrend (MBC trend)

## Executive Summary

Завершена фаза SymptomTrend: добавлен вычисляемый endpoint тренда скринингов пациента по выбранному опроснику. MBC-цепочка Diagnosis → Assessment Plan → Screening → Trend теперь закрыта на уровне API без дополнительной миграции (тренд вычисляется из `screening_results`).

## Files Changed

- `app/api/v1/screenings.py` — добавлен `GET /api/v1/patients/{patient_id}/screening-trend`; расширена clinic isolation для patient screenings history.
- `tests/api/test_screenings_api.py` — добавлен `test_patient_screening_trend`.
- `docs/DB_SCHEMA.md`, `docs/DOMAIN_MODEL.md` — обновлены MBC chain и список нереализованных блоков.

## Database Changes

Нет новых миграций. Тренд вычисляется из существующей таблицы `screening_results`.

## API Changes

- `GET /api/v1/patients/{patient_id}/screening-trend?questionnaire_code=...&limit=...` — RBAC `screening:read`, ownership/clinic isolation, ответ с `trend`, `delta`, `average_score`, `first_score`, `last_score`, `items`.

## Tests

- `pytest`: 85 passed.
- Добавлен smoke-тест тренда.

## Risks

- Тренд эвристический (порог ±2 балла); при необходимости уточнить клинические правила.
- Нет отдельного хранения тренда; при росте данных возможна оптимизация.

## Next Step

Переход к следующему модулю (например, Safety Plan / Adherence) или Phase 10 (Audit & Security).