"""Migration 0038: care plan enriched payload (treatment plan UI)."""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0038_care_plan_payload"
down_revision: str | None = "0037_patient_self_reported_meds"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("care_plans", sa.Column("plan_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    op.drop_column("care_plans", "plan_payload")