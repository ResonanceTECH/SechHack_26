"""Миграция 0010: care_plans, exercise_assignments, exercise_completions."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0010_care_plans"
down_revision: str | None = "0009_safety_plans_crisis_signals"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "care_plans",
        sa.Column("id", sa.UUID(), nullable=False, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("patient_id", sa.UUID(), nullable=False),
        sa.Column("practitioner_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["patient_id"], ["patient_profiles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["practitioner_id"], ["practitioner_profiles.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("status IN ('active','completed','archived')", name="ck_care_plans_status"),
    )
    op.create_index("idx_care_plans_patient_id", "care_plans", ["patient_id"])

    op.create_table(
        "exercise_assignments",
        sa.Column("id", sa.UUID(), nullable=False, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("care_plan_id", sa.UUID(), nullable=False),
        sa.Column("exercise_type", sa.String(100), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=True),
        sa.Column("scheduled_for", sa.Date(), nullable=True),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["care_plan_id"], ["care_plans.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_exercise_assignments_care_plan_id", "exercise_assignments", ["care_plan_id"])

    op.create_table(
        "exercise_completions",
        sa.Column("id", sa.UUID(), nullable=False, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("assignment_id", sa.UUID(), nullable=False),
        sa.Column("patient_id", sa.UUID(), nullable=False),
        sa.Column("result", postgresql.JSONB(), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["assignment_id"], ["exercise_assignments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["patient_id"], ["patient_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_exercise_completions_assignment_id", "exercise_completions", ["assignment_id"])


def downgrade() -> None:
    op.drop_index("idx_exercise_completions_assignment_id", table_name="exercise_completions")
    op.drop_table("exercise_completions")
    op.drop_index("idx_exercise_assignments_care_plan_id", table_name="exercise_assignments")
    op.drop_table("exercise_assignments")
    op.drop_index("idx_care_plans_patient_id", table_name="care_plans")
    op.drop_table("care_plans")