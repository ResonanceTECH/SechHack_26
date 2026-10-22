"""Общие фикстуры pytest."""
from __future__ import annotations

import os
import socket

import pytest

os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("SECRET_KEY", "test-secret-key-0123456789abcdef0123456789")

from app.db.session import engine as app_engine


def _pg_available() -> bool:
    try:
        with socket.create_connection(("localhost", 5432), timeout=0.3):
            return True
    except OSError:
        return False


def pytest_collection_modifyitems(config, items) -> None:
    if os.getenv("SKIP_DB_TESTS") == "1" or not _pg_available():
        skip_db = pytest.mark.skip(reason="Postgres недоступен или SKIP_DB_TESTS=1 (TESTS.md §2)")
        for item in items:
            if "db" in item.keywords:
                item.add_marker(skip_db)


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture(autouse=True)
async def _dispose_app_engine():
    yield
    await app_engine.dispose()
