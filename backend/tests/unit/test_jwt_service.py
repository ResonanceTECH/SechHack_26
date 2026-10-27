"""Unit-тесты JWT: claims, тип токена, срок действия (AUTH_PLAN.md §2)."""

import uuid
from datetime import UTC, datetime, timedelta

import jwt as pyjwt
import pytest

from app.core.config import get_settings
from app.core.errors import ApiError
from app.core.security import jwt as jwt_service


class TestAccessToken:
    def test_claims_structure(self) -> None:
        user_id = uuid.uuid4()
        token = jwt_service.create_access_token(user_id=user_id, role="doctor")
        payload = jwt_service.decode_token(token, expected_type="access")
        assert payload.sub == str(user_id)
        assert payload.role == "doctor"
        assert payload.token_type == "access"
        assert payload.jti

    def test_wrong_expected_type_rejected(self) -> None:
        token = jwt_service.create_access_token(user_id=uuid.uuid4(), role="patient")
        with pytest.raises(ApiError) as exc:
            jwt_service.decode_token(token, expected_type="refresh")
        assert exc.value.status_code == 401


class TestRefreshToken:
    def test_refresh_carries_token_version(self) -> None:
        user_id = uuid.uuid4()
        token = jwt_service.create_refresh_token(user_id=user_id, token_version=3)
        payload = jwt_service.decode_token(token, expected_type="refresh")
        assert payload.token_version == 3
        assert payload.token_type == "refresh"


class TestTamperedTokens:
    def test_bad_signature_rejected(self) -> None:
        claims = {
            "sub": str(uuid.uuid4()),
            "jti": "x",
            "type": "access",
            "exp": datetime.now(UTC) + timedelta(minutes=15),
        }
        forged = pyjwt.encode(claims, "attacker-secret-key-attacker-secret", algorithm="HS256")
        with pytest.raises(ApiError):
            jwt_service.decode_token(forged, expected_type="access")

    def test_expired_token_rejected(self) -> None:
        settings = get_settings()
        claims = {
            "sub": str(uuid.uuid4()),
            "jti": "x",
            "type": "access",
            "exp": datetime.now(UTC) - timedelta(minutes=1),
        }
        expired = pyjwt.encode(claims, settings.secret_key, algorithm=settings.algorithm)
        with pytest.raises(ApiError):
            jwt_service.decode_token(expired, expected_type="access")
