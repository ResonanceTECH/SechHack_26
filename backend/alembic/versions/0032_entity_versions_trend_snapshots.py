"""Migration 0032: universal entity versioning + trend snapshots storage."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0032_versions_trends"
down_revision: str | None = "0031_rls_remaining_phi"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "entity_versions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("changed_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("changed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("reason", sa.Text()),
        sa.Column("is_addendum", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("snapshot", postgresql.JSONB(), nullable=False),
    )
    op.create_index("idx_entity_versions_entity", "entity_versions", ["entity_type", "entity_id"])
    op.create_index("idx_entity_versions_changed_at", "entity_versions", ["changed_at"])

    op.create_table(
        "trend_snapshots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("questionnaire_code", sa.String(50), nullable=False),
        sa.Column("period", sa.String(20), nullable=False, server_default=sa.text("'weekly'")),
        sa.Column("window_start", sa.Date(), nullable=False),
        sa.Column("window_end", sa.Date(), nullable=False),
        sa.Column("avg_score", sa.Float()),
        sa.Column("min_score", sa.Integer()),
        sa.Column("max_score", sa.Integer()),
        sa.Column("trend_direction", sa.String(20)),
        sa.Column("computed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("data", postgresql.JSONB()),
    )
    op.create_index("idx_trend_snapshots_patient_code_period", "trend_snapshots", ["patient_id", "questionnaire_code", "period", "window_start"])


def downgrade() -> None:
    op.drop_index("idx_trend_snapshots_patient_code_period", table_name="trend_snapshots")
    op.drop_table("trend_snapshots")
    op.drop_index("idx_entity_versions_changed_at", table_name="entity_versions")
    op.drop_index("idx_entity_versions_entity", table_name="entity_versions")
    op.drop_table("entity_versions")
