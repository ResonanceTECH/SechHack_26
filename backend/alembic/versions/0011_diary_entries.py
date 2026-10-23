"""Migration 0011: diary_entries (new scales)."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0011_diary_entries"
down_revision: str | None = "0010_care_plans"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "diary_entries",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("mood_score", sa.Integer, nullable=True),
        sa.Column("anxiety_score", sa.Integer, nullable=True),
        sa.Column("energy_score", sa.Integer, nullable=True),
        sa.Column("functioning_score", sa.Integer, nullable=True),
        sa.Column("sleep_hours", sa.Float, nullable=True),
        sa.Column("sleep_quality", sa.Integer, nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("device_id", sa.String(100), nullable=True),
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.CheckConstraint("mood_score IS NULL OR mood_score BETWEEN -3 AND 3", name="ck_diary_entries_mood_score"),
        sa.CheckConstraint("anxiety_score IS NULL OR anxiety_score BETWEEN 0 AND 4", name="ck_diary_entries_anxiety_score"),
        sa.CheckConstraint("energy_score IS NULL OR energy_score BETWEEN 0 AND 4", name="ck_diary_entries_energy_score"),
        sa.CheckConstraint("functioning_score IS NULL OR functioning_score BETWEEN 0 AND 4", name="ck_diary_entries_functioning_score"),
    )
    op.create_index("idx_diary_entries_patient_id_recorded_at", "diary_entries", ["patient_id", "recorded_at"])
    op.create_index("idx_diary_entries_synced_at", "diary_entries", ["synced_at"])
    op.create_index(
        "uq_diary_entries_device_recorded_patient",
        "diary_entries",
        ["device_id", "recorded_at", "patient_id"],
        unique=True,
        postgresql_where=sa.text("device_id IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index("uq_diary_entries_device_recorded_patient", table_name="diary_entries")
    op.drop_index("idx_diary_entries_synced_at", table_name="diary_entries")
    op.drop_index("idx_diary_entries_patient_id_recorded_at", table_name="diary_entries")
    op.drop_table("diary_entries")