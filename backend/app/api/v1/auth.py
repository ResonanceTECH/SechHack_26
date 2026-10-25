"""Эндпоинты аутентификации (API_CONTRACTS.md §2).

Два входа: email+пароль (веб) и телефон+SMS (мобилка); оба выдают одинаковую
пару access/refresh. Invite-код привязывает пациента к врачу.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Request, status
from sqlalchemy import select

from app.api.dependencies import CurrentUser, DbSession
from app.core.config import get_settings
from app.core.errors import invalid_credentials, not_found, rate_limited
from app.core.ratelimit import limiter
from app.core.response import envelope
from app.models.profile import PatientProfile, PractitionerProfile
from app.schemas.auth import (
    ChangePasswordRequest,
    ConsentRequest,
    InviteVerifyRequest,
    InviteVerifyResult,
    LoginRequest,
    LogoutRequest,
    MeResponse,
    RefreshRequest,
    RegisterRequest,
    SmsRequestModel,
    SmsVerifyRequest,
    TokenPair,
    UserBrief,
)
from app.schemas.common import EnvelopeResponse
from app.services import auth_service, invite_service, sms_service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _rid(request: Request) -> str:
    return getattr(request.state, "request_id", "")


def _tokens_data(tokens: TokenPair) -> dict:
    return tokens.model_dump()


async def _get_practitioner(db: DbSession, practitioner_id: uuid.UUID) -> PractitionerProfile:
    practitioner = (
        await db.execute(
            select(PractitionerProfile).where(PractitionerProfile.id == practitioner_id)
        )
    ).scalar_one_or_none()
    if practitioner is None:
        raise not_found("Специалист не найден")
    return practitioner


# ---------------------------------------------------------------- register / login


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=EnvelopeResponse, responses={400: {"description": "Некорректный запрос"}, 409: {"description": "Конфликт (дубликат)"}, 422: {"description": "Ошибка валидации"}})
async def register(body: RegisterRequest, request: Request, db: DbSession) -> dict:
    """Регистрация email+пароль (веб) с согласиями 152-ФЗ. Роль — patient."""
    _, tokens = await auth_service.register(
        db,
        email=body.email,
        password=body.password,
        first_name=body.first_name,
        last_name=body.last_name,
    )
    return envelope(data=_tokens_data(tokens), request_id=_rid(request))


@router.post("/login", response_model=EnvelopeResponse, responses={401: {"description": "Неверные учетные данные"}, 422: {"description": "Ошибка валидации"}, 429: {"description": "Превышен лимит запросов"}})
async def login(body: LoginRequest, request: Request, db: DbSession) -> dict:
    """Вход по email+пароль. Rate limit: 5 попыток / 15 минут на email."""
    settings = get_settings()
    key = f"login:{body.email.lower()}"
    if not limiter.check(
        key,
        limit=settings.login_rate_limit_attempts,
        window_seconds=settings.login_rate_window_seconds,
    ):
        raise rate_limited("Слишком много попыток входа, попробуйте позже")
    _, tokens = await auth_service.login(db, email=body.email, password=body.password)
    limiter.reset(key)
    return envelope(data=_tokens_data(tokens), request_id=_rid(request))


# ---------------------------------------------------------------- SMS (мобилка)


@router.post("/sms/request", response_model=EnvelopeResponse, responses={422: {"description": "Ошибка валидации"}})
async def sms_request(body: SmsRequestModel, request: Request, db: DbSession) -> dict:
    """Запрос SMS-кода: 4 цифры, TTL 5 минут. Повтор — не чаще 1 раза/60 сек."""
    await sms_service.request_code(db, body.phone)
    # Ответ одинаков для любого номера — защита от перечисления (AUTH_PLAN.md §8)
    return envelope(data={"status": "sent"}, request_id=_rid(request))


@router.post("/sms/verify", response_model=EnvelopeResponse, responses={401: {"description": "Некорректный SMS-код"}, 422: {"description": "Ошибка валидации"}})
async def sms_verify(body: SmsVerifyRequest, request: Request, db: DbSession) -> dict:
    """Проверка SMS-кода → регистрация/вход по телефону, возврат токенов."""
    if not await sms_service.verify_code(db, body.phone, body.code):
        raise invalid_credentials("Некорректный или просроченный SMS-код")
    _, tokens = await auth_service.login_by_phone(db, phone=body.phone)
    return envelope(data=_tokens_data(tokens), request_id=_rid(request))


# ---------------------------------------------------------------- invite-код


@router.post("/invite/verify", response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 404: {"description": "Invite-код не найден"}, 422: {"description": "Ошибка валидации"}})
async def invite_verify(
    body: InviteVerifyRequest, request: Request, db: DbSession, user: CurrentUser
) -> dict:
    """Привязка пациента к врачу по invite-коду. Доступен и сразу после
    sms/verify (свежие токены), и позже под активным JWT (флоу Skip)."""
    assignment = await invite_service.verify_invite_code(db, user=user, code=body.code)
    result = InviteVerifyResult(
        practitioner_id=assignment.practitioner_id,
        clinic_id=assignment.clinic_id,
    )
    return envelope(data=result.model_dump(mode="json"), request_id=_rid(request))


# ---------------------------------------------------------------- сессии


@router.post("/refresh", response_model=EnvelopeResponse, responses={401: {"description": "Недействительный refresh-токен"}, 422: {"description": "Ошибка валидации"}})
async def refresh(body: RefreshRequest, request: Request, db: DbSession) -> dict:
    """Обновление пары токенов. Rotation: повторное использование старого
    refresh → отзыв всех сессий (AUTH_PLAN.md §2)."""
    tokens = await auth_service.refresh(db, refresh_token=body.refresh_token)
    return envelope(data=_tokens_data(tokens), request_id=_rid(request))


@router.post("/logout", response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 422: {"description": "Ошибка валидации"}})
async def logout(body: LogoutRequest, request: Request, db: DbSession, user: CurrentUser) -> dict:
    """Инвалидация refresh-токена (или всех сессий, если токен не передан)."""
    await auth_service.logout(db, user_id=user.id, refresh_token=body.refresh_token)
    return envelope(data={"logged_out": True}, request_id=_rid(request))


@router.get("/me", response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}})
async def me(db: DbSession, user: CurrentUser, request: Request) -> dict:
    """Профиль текущего пользователя (+ ФИО из профиля, если есть)."""
    profile = (
        await db.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))
    ).scalar_one_or_none()
    brief = UserBrief(
        id=user.id,
        email=user.email,
        phone=user.phone,
        role=user.role,
        first_name=profile.first_name if profile else None,
        last_name=profile.last_name if profile else None,
    )
    return envelope(data=MeResponse(user=brief).model_dump(mode="json"), request_id=_rid(request))


@router.post("/consent", response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 404: {"description": "Профиль не найден"}, 422: {"description": "Ошибка валидации"}})
async def store_consent(
    body: ConsentRequest, request: Request, db: DbSession, user: CurrentUser
) -> dict:
    """Сохранение согласий 152-ФЗ для текущего пациента."""
    result = await auth_service.store_consent(
        db,
        user=user,
        consent_personal_data=body.consent_personal_data,
        consent_medical_data=body.consent_medical_data,
        consent_data_sharing_with_doctor=body.consent_data_sharing_with_doctor,
    )
    return envelope(data=result, request_id=_rid(request))


@router.post("/change-password", response_model=EnvelopeResponse, responses={401: {"description": "Не авторизован"}, 422: {"description": "Ошибка валидации"}})
async def change_password(
    body: ChangePasswordRequest, request: Request, db: DbSession, user: CurrentUser
) -> dict:
    """Смена пароля (email+пароль аккаунты). После смены — отзыв сессий."""
    await auth_service.change_password(
        db, user=user, current_password=body.current_password, new_password=body.new_password
    )
    return envelope(data={"changed": True}, request_id=_rid(request))
