"""FastAPI-приложение «Клинический компас» — точка входа.

Запуск (из каталога backend):
    uvicorn app.main:app --host 0.0.0.0 --port 3001
"""

from __future__ import annotations

import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.errors import ApiError
from app.core.response import envelope

settings = get_settings()

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "Старт %s v%s (env=%s, port=%d)",
        settings.app_name,
        settings.app_version,
        settings.environment,
        settings.port,
    )
    yield
    logger.info("Остановка приложения")


app = FastAPI(
    title="Clinical Compass API",
    version=settings.app_version,
    description="Бэкенд «Клинический компас» — актуальный контракт: OpenAPI, BACKEND_SPEC.md, CLIENT_MAPPING.md",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_BODY_BYTES = 1 * 1024 * 1024  # 1 MB — защита от DoS на bulk-sync (AUTH_PLAN.md §8)


@app.middleware("http")
async def request_context(request: Request, call_next):
    """request-id в конверт и заголовок, лимит тела запроса, security-заголовки."""
    request.state.request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_BODY_BYTES:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content=envelope(
                request_id=request.state.request_id,
                error={"code": "validation_error", "message": "Тело запроса превышает 1 МБ"},
            ),
        )
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000"
    return response


# ---- Обработчики ошибок → единый конверт {data, meta, error} ----


@app.exception_handler(ApiError)
async def api_error_handler(request: Request, exc: ApiError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=envelope(
            request_id=getattr(request.state, "request_id", None),
            error={"code": exc.code, "message": exc.message},
        ),
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    # Первая ошибка валидации — клиенту, детали — в лог (без тел запросов)
    message = (
        exc.errors()[0].get("msg", "Ошибка валидации")
        if exc.errors()
        else "Ошибка валидации"
    )
    logger.info("Validation error: %s", message)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=envelope(
            request_id=getattr(request.state, "request_id", None),
            error={"code": "validation_error", "message": message},
        ),
    )


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    code_map = {
        status.HTTP_401_UNAUTHORIZED: "unauthorized",
        status.HTTP_403_FORBIDDEN: "forbidden",
        status.HTTP_404_NOT_FOUND: "not_found",
        status.HTTP_409_CONFLICT: "conflict",
        status.HTTP_429_TOO_MANY_REQUESTS: "rate_limited",
    }
    return JSONResponse(
        status_code=exc.status_code,
        content=envelope(
            request_id=getattr(request.state, "request_id", None),
            error={
                "code": code_map.get(exc.status_code, "internal_error"),
                "message": str(exc.detail),
            },
        ),
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    # Полный traceback — только в лог; клиенту — обобщённая ошибка (AUTH_PLAN.md §8)
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=envelope(
            request_id=getattr(request.state, "request_id", None),
            error={"code": "internal_error", "message": "Внутренняя ошибка сервера"},
        ),
    )


app.include_router(api_router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    from fastapi.openapi.utils import get_openapi

    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    schema.setdefault("components", {}).setdefault("securitySchemes", {})["bearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }
    schema["security"] = [{"bearerAuth": []}]
    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi
