"""SMS-коды подтверждения телефона (AUTH_PLAN.md §3.1).

4 цифры, TTL 5 минут, одноразовый, максимум попыток ввода. В БД — только
SHA-256-хеш (с солью телефона). Повторная отправка — не чаще 1 раза в
60 секунд; не более 5 SMS в час на номер. В dev SMS не отправляется —
код пишется в лог сервера.
"""

from __future__ import annotations

import hashlib
import logging
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import rate_limited
from app.models.auth import SmsCode

logger = logging.getLogger("app.sms")


def _code_hash(phone: str, code: str) -> str:
    """SHA-256(phone:code) — хеш восстановим брутфорсом только по конкретному
    номеру, а не по всей таблице сразу."""
    return hashlib.sha256(f"{phone}:{code}".encode()).hexdigest()


def generate_code() -> str:
    """4-значный код, включая ведущие нули («0427»)."""
    return f"{secrets.randbelow(10000):04d}"


async def request_code(session: AsyncSession, phone: str) -> None:
    """Создать и «отправить» SMS-код. Бросает 429 при rate limit."""
    settings = get_settings()
    now = datetime.now(UTC)

    # Не чаще 1 раза в 60 секунд на номер
    last = (
        await session.execute(
            select(SmsCode.created_at)
            .where(SmsCode.phone == phone)
            .order_by(SmsCode.created_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()
    if last and (now - last).total_seconds() < settings.sms_resend_seconds:
        raise rate_limited("SMS-код уже отправлен, подождите перед повторным запросом")

    # Не более 5 SMS в час на номер
    hour_ago = now - timedelta(hours=1)
    per_hour = (
        await session.execute(
            select(func.count(SmsCode.id)).where(
                SmsCode.phone == phone, SmsCode.created_at >= hour_ago
            )
        )
    ).scalar_one()
    if per_hour >= settings.sms_max_per_hour:
        raise rate_limited("Превышен лимит SMS-кодов на этот номер, попробуйте позже")

    code = generate_code()
    session.add(
        SmsCode(
            phone=phone,
            code_hash=_code_hash(phone, code),
            expires_at=now + timedelta(seconds=settings.sms_code_ttl_seconds),
        )
    )
    await session.commit()

    # Dev-заглушка: реальная интеграция с SMSC/UniSMS — после MVP
    masked = f"{phone[:3]}****{phone[-2:]}"
    if get_settings().environment == "production":  # pragma: no cover
        logger.warning("SMS provider not configured; code suppressed in production")
    else:
        logger.info("SMS-код для %s: %s (dev-заглушка, в лог)", masked, code)


async def verify_code(session: AsyncSession, phone: str, code: str) -> bool:
    """Проверить код: TTL, попытки, одноразовость. Успех → is_used=True."""
    settings = get_settings()
    now = datetime.now(UTC)

    sms = (
        await session.execute(
            select(SmsCode)
            .where(SmsCode.phone == phone, SmsCode.is_used.is_(False))
            .order_by(SmsCode.created_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()

    if sms is None or sms.expires_at < now:
        return False

    # Фиксируем попытку до сравнения — защита от перебора 4-значного кода
    sms.attempts += 1
    if sms.attempts > settings.sms_max_attempts:
        sms.is_used = True  # инвалидируем код при исчерпании попыток
        await session.commit()
        return False

    if sms.code_hash != _code_hash(phone, code):
        await session.commit()
        return False

    sms.is_used = True
    await session.commit()
    return True
