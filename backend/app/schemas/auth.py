"""Схемы аутентификации (API_CONTRACTS.md §2, AUTH_PLAN.md §3)."""

from __future__ import annotations

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.security.passwords import validate_password_policy

# E.164: + и 10–15 цифр; принимаем и «человеческий» ввод «+7 916 123-45-67»
_PHONE_RE = re.compile(r"^\+[1-9]\d{6,14}$")
# Invite-код: префикс из букв + цифры/буквы алфавита; дефис допустим как
# маска UI, но нормализуется в сервисе (на бэкенд — без дефиса)
_INVITE_CODE_RE = re.compile(r"^[A-Z0-9]{4,20}$")


def _normalize_phone(value: str) -> str:
    cleaned = re.sub(r"[\s\-()]", "", value)
    if not _PHONE_RE.match(cleaned):
        raise ValueError("Некорректный формат телефона (ожидается E.164, например +79991234567)")
    return cleaned


class RegisterRequest(BaseModel):
    """Регистрация email+пароль (веб) с согласиями 152-ФЗ (API_CONTRACTS.md §2)."""

    email: EmailStr
    password: str = Field(min_length=1, repr=False)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    consent_personal_data: bool = False
    consent_medical_data: bool = False

    @field_validator("password")
    @classmethod
    def _check_password_policy(cls, value: str) -> str:
        validate_password_policy(value)
        return value

    model_config = {"json_schema_extra": {"example": {"email": "patient@example.com", "password": "StrongPass123!", "first_name": "Иван", "last_name": "Иванов", "consent_personal_data": True, "consent_medical_data": True}}}

    @field_validator("consent_personal_data", "consent_medical_data")
    @classmethod
    def _consent_required(cls, value: bool) -> bool:
        # 152-ФЗ: без согласия на обработку данных регистрация невозможна
        if not value:
            raise ValueError("Требуется согласие на обработку данных (152-ФЗ)")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, repr=False)


class SmsRequestModel(BaseModel):
    """Запрос SMS-кода (мобилка). Имя модели не SmsRequest, чтобы не
    конфликтовать с генерируемой схемой в OpenAPI-страждателе."""

    phone: str

    @field_validator("phone")
    @classmethod
    def _phone(cls, value: str) -> str:
        return _normalize_phone(value)


class SmsVerifyRequest(BaseModel):
    phone: str
    code: str = Field(min_length=4, max_length=4, pattern=r"^\d{4}$")

    @field_validator("phone")
    @classmethod
    def _phone(cls, value: str) -> str:
        return _normalize_phone(value)


class InviteVerifyRequest(BaseModel):
    code: str

    @field_validator("code")
    @classmethod
    def _code(cls, value: str) -> str:
        normalized = re.sub(r"[\s\-]", "", value).upper()
        if not _INVITE_CODE_RE.match(normalized):
            raise ValueError("Некорректный формат invite-кода")
        return normalized


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, repr=False)
    new_password: str = Field(min_length=1, repr=False)

    @field_validator("new_password")
    @classmethod
    def _check_password_policy(cls, value: str) -> str:
        validate_password_policy(value)
        return value


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserBrief(BaseModel):
    id: uuid.UUID
    email: str | None = None
    phone: str | None = None
    role: str
    first_name: str | None = None
    last_name: str | None = None


class MeResponse(BaseModel):
    user: UserBrief
    consent_personal_data: bool = False
    consent_medical_data: bool = False
    consent_data_sharing_with_doctor: bool = False
    has_patient_profile: bool = False


class InviteCodeCreateRequest(BaseModel):
    """Врач задаёт TTL кода; опционально — мультииспользование."""

    expires_in_days: int = Field(default=30, ge=1, le=365)
    is_multi_use: bool = False
    max_uses: int | None = Field(default=None, ge=1)


class InviteCodeResponse(BaseModel):
    id: uuid.UUID
    code: str
    expires_at: datetime
    is_multi_use: bool
    max_uses: int | None
    uses_count: int
    is_active: bool

    model_config = {"from_attributes": True}


class ConsentRequest(BaseModel):
    """Согласия 152-ФЗ (мобильный экран RegisterConsentScreen)."""

    consent_personal_data: bool
    consent_medical_data: bool
    consent_data_sharing_with_doctor: bool = False

    @field_validator("consent_personal_data", "consent_medical_data")
    @classmethod
    def _required(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Требуется согласие на обработку данных (152-ФЗ)")
        return value

class InviteVerifyResult(BaseModel):
    """Ответ успешной привязки пациента к врачу."""

    assigned: bool = True
    practitioner_id: uuid.UUID
    clinic_id: uuid.UUID
