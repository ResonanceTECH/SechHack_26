"""Таблицы сессий и привязок auth-контура (DB_SCHEMA.md §1):
refresh_tokens, sms_codes, invite_codes.

Хранятся только хеши: SHA-256 refresh-токена и SMS-кода — при компрометации
БД восстановление токенов/кодов невозможно.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPkMixin


class RefreshToken(UUIDPkMixin, Base):
    __tablename__ = "refresh_tokens"
    __table_args__ = (
        Index("idx_refresh_tokens_user_id", "user_id"),
        Index("idx_refresh_tokens_token_hash", "token_hash", unique=True),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    replaced_by_token_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("refresh_tokens.id")
    )
    device_info: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<RefreshToken {self.id} user={self.user_id} revoked={self.revoked_at is not None}>"


class SmsCode(UUIDPkMixin, Base):
    """Одноразовый SMS-код: 4 цифры, TTL 5 минут, максимум попыток ввода."""

    __tablename__ = "sms_codes"
    __table_args__ = (Index("idx_sms_codes_phone", "phone"),)

    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    code_hash: Mapped[str] = mapped_column(String(255), nullable=False)  # SHA-256, не код
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    attempts: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<SmsCode {self.id} phone={self.phone} used={self.is_used}>"


class InviteCode(UUIDPkMixin, Base):
    """Invite-код привязки пациента к врачу.

    Формат: код БЕЗ дефиса («RAV27400»); дефис — только UI-маска мобилки.
    Алфавит: 23456789ABCDEFGHJKLMNPQRSTUVWXYZ (исключены только 0/1/I/O —
    контракт с командой, без исключений).
    """

    __tablename__ = "invite_codes"
    __table_args__ = (
        Index("idx_invite_codes_practitioner_id", "practitioner_id"),
        Index("idx_invite_codes_is_active", "is_active"),
    )

    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    practitioner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("practitioner_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    clinic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_multi_use: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    max_uses: Mapped[int | None] = mapped_column(Integer, default=1, server_default="1")
    uses_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=None, server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<InviteCode {self.code} uses={self.uses_count}/{self.max_uses}>"
