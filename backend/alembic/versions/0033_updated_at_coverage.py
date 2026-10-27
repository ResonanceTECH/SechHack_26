"""Migration 0033: add updated_at to mutable entities (full coverage)."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0033_updated_at_coverage"
down_revision: str | None = "0032_versions_trends"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None

TABLES = [
    "patient_assignments",
    "alerts",
    "practitioner_profiles",
    "practitioner_schedules",
    "practitioner_schedule_exceptions",
]


def upgrade() -> None:
    for table in TABLES:
        op.add_column(
            table,
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        )


def downgrade() -> None:
    for table in reversed(TABLES):
        op.drop_column(table, "updated_at")