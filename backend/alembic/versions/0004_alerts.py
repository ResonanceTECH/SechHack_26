"""Миграция 0004: alerts table."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0004_alerts"
down_revision: str | None = "0003_screening_hardening"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "alerts",
        sa.Column("id", sa.UUID(), nullable=False, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("patient_id", sa.UUID(), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("priority", sa.String(20), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="new"),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_by", sa.UUID(), nullable=True),
        sa.ForeignKeyConstraint(["patient_id"], ["patient_profiles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resolved_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "type IN ('critical_symptom','adherence','missed_diary','screening_risk','adverse_event')",
            name="ck_alerts_type",
        ),
        sa.CheckConstraint("priority IN ('mandatory','optional','rx')", name="ck_alerts_priority"),
        sa.CheckConstraint(
            "status IN ('new','in_progress','resolved','dismissed')", name="ck_alerts_status"
        ),
    )
    op.create_index("idx_alerts_patient_id_status", "alerts", ["patient_id", "status"])
    op.create_index("idx_alerts_priority_created_at", "alerts", ["priority", "created_at"])


def downgrade() -> None:
    op.drop_index("idx_alerts_priority_created_at", table_name="alerts")
    op.drop_index("idx_alerts_patient_id_status", table_name="alerts")
    op.drop_table("alerts")
