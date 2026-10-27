"""Unit-тесты: без БД, чистая логика."""

import pytest

from app.core.security.passwords import (
    hash_password,
    validate_password_policy,
    verify_password,
)


class TestPasswordHashing:
    def test_hash_is_argon2id_not_plaintext(self) -> None:
        h = hash_password("SecurePass123")
        assert h != "SecurePass123"
        assert h.startswith("$argon2id$"), "В БД должен попадать argon2id-хеш"

    def test_verify_correct_password(self) -> None:
        h = hash_password("SecurePass123")
        assert verify_password(h, "SecurePass123") is True

    def test_verify_wrong_password(self) -> None:
        h = hash_password("SecurePass123")
        assert verify_password(h, "WrongPass123") is False

    def test_verify_none_hash_returns_false(self) -> None:
        """SMS-аккаунт без пароля: verify(None, ...) → False, не исключение."""
        assert verify_password(None, "anything") is False

    def test_two_hashes_of_same_password_differ(self) -> None:
        """Случайная соль: одинаковые пароли → разные хеши."""
        assert hash_password("SecurePass123") != hash_password("SecurePass123")


class TestPasswordPolicy:
    @pytest.mark.parametrize(
        "password",
        ["short1A", "alllowercase123", "ALLUPPERCASE123", "NoDigitsHere!!", "1234567890"],
    )
    def test_policy_rejects_weak(self, password: str) -> None:
        with pytest.raises(ValueError):
            validate_password_policy(password)

    def test_policy_accepts_strong(self) -> None:
        validate_password_policy("SecurePass123")  # не бросает исключение
