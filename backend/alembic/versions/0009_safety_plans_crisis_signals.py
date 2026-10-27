"""Migration 0009: safety plans and crisis signals."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

from alembic import op

revision: str = "0009_safety_plans_crisis_signals"
down_revision: str | None = "0008_assessment_plans"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "crisis_signals",
        sa.Column("id", sa.UUID(), nullable=False, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("patient_id", sa.UUID(), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("source", sa.String(50), nullable=False),
        sa.Column("triggered_by_screening_id", sa.UUID(), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("location", JSONB, nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="new"),
        sa.Column("priority", sa.String(20), nullable=False, server_default="critical"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("acknowledged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("acknowledged_by", sa.UUID(), nullable=True),
        sa.ForeignKeyConstraint(["patient_id"], ["patient_profiles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["triggered_by_screening_id"], ["screening_results.id"]),
        sa.ForeignKeyConstraint(["acknowledged_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("type IN ('sos_call','critical_symptom','red_flag')", name="ck_crisis_signals_type"),
        sa.CheckConstraint("source IN ('mobile_app','web_app','screening_result','practitioner_manual')", name="ck_crisis_signals_source"),
        sa.CheckConstraint("status IN ('new','acknowledged','resolved','false_alarm')", name="ck_crisis_signals_status"),
        sa.CheckConstraint("priority = 'critical'", name="ck_crisis_signals_priority"),
    )
    op.create_index("idx_crisis_signals_patient_id", "crisis_signals", ["patient_id"])
    op.create_index("idx_crisis_signals_status", "crisis_signals", ["status"])
    op.create_index("idx_crisis_signals_created_at", "crisis_signals", ["created_at"])

    op.create_table(
        "safety_plans",
        sa.Column("id", sa.UUID(), nullable=False, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("patient_id", sa.UUID(), nullable=False),
        sa.Column("practitioner_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("warning_signs", sa.Text(), nullable=True),
        sa.Column("internal_coping_strategies", sa.Text(), nullable=True),
        sa.Column("social_contacts", sa.Text(), nullable=True),
        sa.Column("family_support", sa.Text(), nullable=True),
        sa.Column("professional_contacts", sa.Text(), nullable=True),
        sa.Column("emergency_contacts", sa.Text(), nullable=True),
        sa.Column("safe_environment", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("review_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["patient_id"], ["patient_profiles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["practitioner_id"], ["practitioner_profiles.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_safety_plans_patient_id", "safety_plans", ["patient_id"])
    op.create_index("idx_safety_plans_is_active", "safety_plans", ["is_active"])


def downgrade() -> None:
    op.drop_index("idx_safety_plans_is_active", table_name="safety_plans")
    op.drop_index("idx_safety_plans_patient_id", table_name="safety_plans")
    op.drop_table("safety_plans")
    op.drop_index("idx_crisis_signals_created_at", table_name="crisis_signals")
    op.drop_index("idx_crisis_signals_status", table_name="crisis_signals")
    op.drop_index("idx_crisis_signals_patient_id", table_name="crisis_signals")
    op.drop_table("crisis_signals")
