"""Migration 0025: diary entry versions/addendum (strict clinical history)."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0025_diary_entry_versions"
down_revision: str | None = "0024_diary_correction_meta"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "diary_entry_versions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("diary_entry_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("diary_entries.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("changed_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("changed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("reason", sa.Text()),
        sa.Column("is_addendum", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("snapshot", postgresql.JSONB(), nullable=False),
    )
    op.create_index("idx_diary_entry_versions_entry_id", "diary_entry_versions", ["diary_entry_id"])
    op.create_index("idx_diary_entry_versions_changed_at", "diary_entry_versions", ["changed_at"])


def downgrade() -> None:
    op.drop_index("idx_diary_entry_versions_changed_at", table_name="diary_entry_versions")
    op.drop_index("idx_diary_entry_versions_entry_id", table_name="diary_entry_versions")
    op.drop_table("diary_entry_versions")