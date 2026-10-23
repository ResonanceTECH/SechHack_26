"""Migration 0008: assessment_plans table for MBC."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0008_assessment_plans"
down_revision: str | None = "0007_diagnosis_references"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "assessment_plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("diagnosis_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_diagnoses.id", ondelete="SET NULL"), nullable=True),
        sa.Column("questionnaire_code", sa.String(50), nullable=False),
        sa.Column("interval_days", sa.Integer(), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_check_constraint(
        "ck_assessment_plans_interval_days",
        "assessment_plans",
        "interval_days > 0",
    )
    op.create_index("idx_assessment_plans_patient_id", "assessment_plans", ["patient_id"])
    op.create_index("idx_assessment_plans_diagnosis_id", "assessment_plans", ["diagnosis_id"])


def downgrade() -> None:
    op.drop_index("idx_assessment_plans_diagnosis_id", table_name="assessment_plans")
    op.drop_index("idx_assessment_plans_patient_id", table_name="assessment_plans")
    op.drop_constraint("ck_assessment_plans_interval_days", "assessment_plans", type_="check")
    op.drop_table("assessment_plans")
