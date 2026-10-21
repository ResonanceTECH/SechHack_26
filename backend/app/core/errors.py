"""Доменные ошибки API и коды из AUTH_PLAN.md §9."""

from __future__ import annotations


class ApiError(Exception):
    """Ошибка, возвращаемая клиенту в конверте {error: {code, message}}."""

    def __init__(self, status_code: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


# ---- Удобные фабрики (коды и статусы по AUTH_PLAN.md §9) ----


def unauthorized(message: str = "Требуется аутентификация") -> ApiError:
    return ApiError(401, "unauthorized", message)


def forbidden(message: str = "Недостаточно прав") -> ApiError:
    return ApiError(403, "forbidden", message)


def invalid_credentials(message: str = "Некорректный email или пароль") -> ApiError:
    return ApiError(401, "invalid_credentials", message)


def not_found(message: str = "Ресурс не найден") -> ApiError:
    return ApiError(404, "not_found", message)


def validation_error(message: str) -> ApiError:
    return ApiError(422, "validation_error", message)


def rate_limited(message: str = "Слишком много запросов, попробуйте позже") -> ApiError:
    return ApiError(429, "rate_limited", message)


def conflict(message: str = "Конфликт состояния ресурса") -> ApiError:
    return ApiError(409, "conflict", message)


def internal_error(message: str = "Внутренняя ошибка сервера") -> ApiError:
    return ApiError(500, "internal_error", message)
