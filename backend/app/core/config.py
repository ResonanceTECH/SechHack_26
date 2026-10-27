"""Ядро приложения: конфигурация, безопасность, конверт ответов, RBAC."""

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Настройки из переменных окружения / `.env` (см. `\.env.example`)."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ---- Приложение ----
    app_name: str = "clinical-compass-backend"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: str = "development"

    # ---- Сервер ----
    host: str = "0.0.0.0"
    port: int = 3001

    # ---- База данных ----
    database_url: str = Field(..., min_length=1)
    db_pool_size: int = 5
    db_max_overflow: int = 10

    # ---- Redis (включается позже; rate-limit пока in-memory) ----
    redis_url: str = "redis://localhost:6379/0"

    # ---- Безопасность / JWT ----
    secret_key: str = Field(..., min_length=32)
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # ---- SMS (dev-заглушка: код пишется в лог) ----
    sms_code_ttl_seconds: int = 300
    sms_resend_seconds: int = 60
    sms_max_attempts: int = 3
    sms_max_per_hour: int = 5

    # ---- Rate limit входа ----
    login_rate_limit_attempts: int = 5
    login_rate_window_seconds: int = 900

    # ---- CORS (строка через запятую из .env) ----
    cors_origins: str = (
        "http://localhost:5173,http://localhost:3000,exp://localhost:8081,http://10.0.2.2:3001"
    )

    # ---- Логирование ----
    log_level: str = "INFO"

    # ---- Интеграции (МИС / неотложки) ----
    mis_base_url: str = ""
    mis_api_token: str = ""
    emergency_base_url: str = ""
    emergency_api_token: str = ""

    # ---- Alert rules (configurable engine) ----
    alert_rules_file: str = ""
    alert_rules_json: str = ""
    # ---- Тесты ----
    skip_db_tests: bool = False

    @field_validator("database_url", mode="before")
    @classmethod
    def _add_asyncpg_driver(cls, value: str) -> str:
        """Node-совместимость: `postgresql://...` → `postgresql+asyncpg://...`."""
        if not value:
            raise ValueError("DATABASE_URL is required and must not be empty")
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def access_token_ttl_seconds(self) -> int:
        return self.access_token_expire_minutes * 60


@lru_cache
def get_settings() -> Settings:
    """Кэшированный singleton настроек."""
    return Settings()  # type: ignore[call-arg]
