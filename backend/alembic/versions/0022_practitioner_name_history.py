"""Migration 0022: practitioner name history (strict clinical history)."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0022_practitioner_name_history"
down_revision: str | None = "0021_med_adh_corr"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "practitioner_name_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("practitioner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("changed_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("changed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("reason", sa.Text()),
        sa.Column("effective_from", sa.DateTime(timezone=True)),
        sa.Column("effective_to", sa.DateTime(timezone=True)),
        sa.Column("old_first_name", sa.String(100)),
        sa.Column("old_last_name", sa.String(100)),
        sa.Column("old_middle_name", sa.String(100)),
        sa.Column("new_first_name", sa.String(100), nullable=False),
        sa.Column("new_last_name", sa.String(100), nullable=False),
        sa.Column("new_middle_name", sa.String(100)),
    )
    op.create_index("idx_practitioner_name_history_practitioner_id", "practitioner_name_history", ["practitioner_id"])
    op.create_index("idx_practitioner_name_history_changed_at", "practitioner_name_history", ["changed_at"])


def downgrade() -> None:
    op.drop_index("idx_practitioner_name_history_changed_at", table_name="practitioner_name_history")
    op.drop_index("idx_practitioner_name_history_practitioner_id", table_name="practitioner_name_history")
    op.drop_table("practitioner_name_history")