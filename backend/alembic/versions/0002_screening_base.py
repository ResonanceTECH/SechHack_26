"""Миграция 0002: таблица screening_results (PHQ-9 / GAD-7)."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0002_screening_base"
down_revision: str | None = "0001_auth_base"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "screening_results",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("questionnaire_type", sa.String(20), nullable=False),
        sa.Column("questionnaire_version", sa.String(50), nullable=False),
        sa.Column("score", sa.Integer, nullable=False),
        sa.Column("answers", postgresql.JSONB),
        sa.Column("is_critical", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.CheckConstraint("score >= 0", name="ck_screening_results_score_nonneg"),
        sa.CheckConstraint(
            "(questionnaire_type = 'phq9' AND score <= 27) OR "
            "(questionnaire_type = 'gad7' AND score <= 21)",
            name="chk_screening_score_range",
        ),
    )
    op.create_index("idx_screening_results_patient_id_created_at", "screening_results", ["patient_id", "created_at"])
    op.create_index("idx_screening_results_is_critical", "screening_results", ["is_critical"])


def downgrade() -> None:
    op.drop_index("idx_screening_results_is_critical", table_name="screening_results")
    op.drop_index("idx_screening_results_patient_id_created_at", table_name="screening_results")
    op.drop_table("screening_results")
