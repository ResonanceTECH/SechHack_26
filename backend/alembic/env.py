"""Alembic env: URL БД берётся из настроек приложения (DATABASE_URL)."""

from __future__ import annotations

import asyncio

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

# Импорт моделей обязателен: metadata должен знать все таблицы для autogenerate
import app.models  # noqa: F401
from alembic import context
from app.core.config import get_settings
from app.db.base import Base

config = context.config
target_metadata = Base.metadata


def _database_url() -> str:
    # allow_uri_parse: URL подставляется динамически, alembic не парсит его заранее
    return get_settings().database_url


def run_migrations_offline() -> None:
    """Запуск в offline-режиме (генерация SQL без подключения)."""
    context.configure(
        url=_database_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:  # type: ignore[no-untyped-def]
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    engine = create_async_engine(_database_url(), poolclass=pool.NullPool)
    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await engine.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
