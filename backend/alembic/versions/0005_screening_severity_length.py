"""Миграция 0005: увеличение поля severity в screening_results."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0005_screening_severity_length"
down_revision: str | None = "0004_alerts"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column(
        "screening_results",
        "severity",
        existing_type=sa.String(50),
        type_=sa.String(255),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "screening_results",
        "severity",
        existing_type=sa.String(255),
        type_=sa.String(50),
        existing_nullable=True,
    )