# Автотесты — стратегия и структура

**Источник:** `Технологический_стек.md`, `ТЗ_Клинический_Компас_v1.0.md` §8  
**Статус:** автотесты обязательны для MVP; CI прогоняет полный набор перед мержем

## 1. Стек тестирования

| Инструмент | Назначение | Версия |
|---|---|---|
| `pytest` | Раннер | ≥ 8.0 |
| `pytest-asyncio` | Асинхронные тесты (`asyncio_mode = auto`) | ≥ 0.24 |
| `httpx.AsyncClient` | Вызовы ASGI-приложения | ≥ 0.27 |
| `pytest-cov` | Покрытие | ≥ 5.0 |
| `testcontainers[postgres]` | Изолированный PostgreSQL в CI | ≥ 4.8 |
| `fakeredis` | Подмена Redis в unit-тестах | ≥ 2.23 |
| `pytest-httpx` | Моки внешних HTTP-вызовов (FCM, email) | — |
| `freezegun` | Контроль времени (TTL токенов, дедлайны) | ≥ 1.5 |

## 2. База данных в тестах

| Режим | Когда | Как |
|---|---|---|
| **Testcontainers** (основной) | CI, локальная разработка с Docker | Поднимается `postgres:15-alpine`, накатываются миграции Alembic, схема очищается между тестами (truncate) |
| **Локальный PostgreSQL** | Если Docker недоступен | Переменная `TEST_DATABASE_URL`; тесты пропускаются (`pytest.skip`), если БД недоступна и `SKIP_DB_TESTS=1` |

Переменные окружения тестов:
```
TEST_DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/sechhack_test
TEST_REDIS_URL=redis://localhost:6379/15
```

## 3. Структура тестов

```
backend/
├── tests/
│   ├── conftest.py              # фикстуры: db session, app, client, фабрики
│   ├── factories/
│   │   ├── user_factory.py
│   │   ├── patient_factory.py
│   │   └── medication_factory.py
│   ├── unit/                    # изолированные, без БД
│   │   ├── test_screening_scoring.py
│   │   ├── test_password_hashing.py
│   │   ├── test_jwt_service.py
│   │   ├── test_rbac_matrix.py
│   │   ├── test_adherence_calculator.py
│   │   └── test_alert_rules.py
│   ├── integration/             # с БД, без HTTP
│   │   ├── test_patient_repo.py
│   │   ├── test_screening_repo.py
│   │   ├── test_diary_sync.py
│   │   ├── test_alert_lifecycle.py
│   │   └── test_audit_log.py
│   ├── api/                     # через HTTP-клиент
│   │   ├── test_auth_api.py
│   │   ├── test_patients_api.py
│   │   ├── test_screening_api.py
│   │   ├── test_diary_api.py
│   │   ├── test_alerts_api.py
│   │   ├── test_medications_api.py
│   │   └── test_admin_api.py
│   └── security/
│       ├── test_rbac_enforcement.py
│       ├── test_ownership_isolation.py
│       ├── test_token_rotation.py
│       ├── test_rate_limit.py
│       └── test_patient_view_leak.py
└── pytest.ini / pyproject.toml
```

## 4. Ключевые фикстуры (`conftest.py`)

| Фикстура | Назначение |
|---|---|
| `db_session` | Асинхронная сессия SQLAlchemy с откатом транзакции после теста |
| `app` | Экземпляр FastAPI с подменёнными зависимостями (тестовая БД, `fakeredis`) |
## 5. Покрытие по модулям

| Модуль | Что обязательно проверяется |
|---|---|
| `auth-service` | Регистрация с согласиями; логин верный/неверный; refresh rotation; повторное использование отозванного refresh → отзыв всех; выход; смена роли |
| `patient-service` | Список пациентов клиники; карточка; изоляция между клиниками; пациент видит только себя |
| `screening-service` | Подсчёт PHQ-9/GAD-7; границы интерпретации; крит. флаг при п.9 ≥ 1; серверный подсчёт (клиент не влияет) |
| `diary-service` | CRUD; bulk-sync дедупликация по `(device_id, recorded_at, patient_id)`; CHECK-ограничения шкал |
| `program-service` | Назначение упражнения врачом; отметка выполнения пациентом; расчёт adherence |
| `alert-service` | Создание алерта по правилам; приоритет; жизненный цикл; план безопасности для `mandatory` |
| `medication-service` | **Пациент не получает** `contraindications`/`interactions`/`side_effects`; врач получает; назначение только врачом; adherence-расчёт |
| `admin-service` | Список сотрудников; смена роли; аналитика; аудит |
| `audit-service` | Запись события при чтении карточки пациента и изменении роли; пароли/токены не попадают в лог |

## 6. Обязательные security-тесты

| Тест | Проверяемое правило |
|---|---|
| `test_rbac_enforcement` | Каждый эндпоинт недоступен для роли без соответствующего права (403) |
| `test_ownership_isolation` | Пациент A не может читать/менять данные пациента B (403/404) |
| `test_patient_view_leak` | В ответе пациенту нет врачебных полей по лекарствам и нет полей чужих пациентов |
| `test_token_rotation` | Refresh-токен одноразовый; повторное использование → 401 и отзыв сессий |
| `test_expired_token` | Просроченный access-токен → 401 |
| `test_password_hashing` | В БД хранится argon2-хеш, не пароль; проверка устойчива к неверному паролю |
| `test_rate_limit` | 6-я попытка входа с тем же email за 15 минут → 429 |
| `test_sql_injection` | Параметры запроса с `' OR 1=1 --` не влияют на выборку |
| `test_audit_no_secrets` | В `audit_logs` нет паролей и токенов |
| `test_mass_assignment` | Нельзя передать `role`/`clinic_id` в теле запроса на самостоятельное изменение |

## 7. Пороги качества (CI-gate)

| Метрика | Порог |
|---|---|
| Покрытие строк | ≥ 80 % |
| Покрытие ветвлений | ≥ 70 % |
| Покрытие модулей `auth`, `medication`, `alert` | ≥ 90 % |
| Пройденных тестов | 100 % (падений быть не должно) |
| Flaky-тесты | 0 |

## 8. Запуск

```bash
# Все тесты
pytest

# Только быстрые unit-тесты (без БД)
pytest tests/unit -m "not db"

# С покрытием
pytest --cov=app --cov-report=term-missing --cov-report=html

# Только security
pytest tests/security -v
```

## 9. CI (GitHub Actions)

```yaml
name: backend-tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: sechhack_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r requirements-dev.txt
      - run: alembic upgrade head
      - run: pytest --cov=app --cov-fail-under=80
```

## 10. Ограничения MVP

- Нагрузочное тестирование (k6/Locust) — вне MVP; профиль нагрузки появится вместе с пилотом
- Тесты на UI/мобильных клиентах — отдельно (Playwright / Detox), в MVP не входят
- Mutation testing — отложено

| `client` | `httpx.AsyncClient` с `ASGITransport` |
| `auth_headers` | Заголовки `Authorization` для роли `doctor` |
| `patient_headers` | Заголовки для роли `patient` |
| `admin_headers` | Заголовки для роли `clinic_admin` |
| `make_user` | Фабрика пользователя с заданной ролью и паролем |
| `make_patient` | Фабрика пациента, привязанного к клинике и врачу |
