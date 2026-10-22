"""Миграция 0003: hardening screening_results."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0003_screening_hardening"
down_revision: str | None = "0002_screening_base"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("screening_results", sa.Column("severity", sa.String(50), nullable=True))
    op.add_column("screening_results", sa.Column("critical_reason", sa.String(200), nullable=True))


def downgrade() -> None:
    op.drop_column("screening_results", "critical_reason")
    op.drop_column("screening_results", "severity")
