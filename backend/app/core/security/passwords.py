"""Хеширование паролей — Argon2id (AUTH_PLAN.md §3).

Параметры MVP: time_cost=3, memory_cost=64 MiB, parallelism=4,
hash_len=32, salt_len=16. Пароль обязателен только для email+пароль входа.
"""

from __future__ import annotations

import re

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

# Один хешер на процесс: повторное создание дорогое (64 MiB на инициализацию)
_hasher = PasswordHasher(
    time_cost=3,
    memory_cost=64 * 1024,  # KiB = 64 MiB
    parallelism=4,
    hash_len=32,
    salt_len=16,
)

PASSWORD_MIN_LENGTH = 10
_PASSWORD_POLICY = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")


def validate_password_policy(password: str) -> None:
    """Политика пароля: минимум 10 символов, буквы разных регистров и цифра.

    Бросает ValueError с русским сообщением — валидация до хеширования.
    """
    if len(password) < PASSWORD_MIN_LENGTH:
        raise ValueError(f"Пароль должен содержать минимум {PASSWORD_MIN_LENGTH} символов")
    if not _PASSWORD_POLICY.match(password):
        raise ValueError("Пароль должен содержать буквы разных регистров и хотя бы одну цифру")


def hash_password(password: str) -> str:
    """Создать argon2id-хеш. Исходный пароль в БД не попадает никогда."""
    return _hasher.hash(password)


def verify_password(password_hash: str | None, password: str) -> bool:
    """Проверить пароль против хеша. None-хеш (SMS-аккаунт) → False."""
    if not password_hash:
        return False
    try:
        return _hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False
