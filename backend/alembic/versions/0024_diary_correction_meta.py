"""Migration 0024: diary entry correction metadata (strict clinical history)."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0024_diary_correction_meta"
down_revision: str | None = "0023_patient_name_history"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("diary_entries", sa.Column("is_edited", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("diary_entries", sa.Column("edited_at", sa.DateTime(timezone=True)))
    op.add_column("diary_entries", sa.Column("edited_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")))
    op.add_column("diary_entries", sa.Column("edit_count", sa.Integer(), nullable=False, server_default=sa.text("0")))
    op.add_column("diary_entries", sa.Column("corrected_at", sa.DateTime(timezone=True)))
    op.add_column("diary_entries", sa.Column("corrected_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")))
    op.add_column("diary_entries", sa.Column("correction_reason", sa.Text()))


def downgrade() -> None:
    op.drop_column("diary_entries", "correction_reason")
    op.drop_column("diary_entries", "corrected_by")
    op.drop_column("diary_entries", "corrected_at")
    op.drop_column("diary_entries", "edit_count")
    op.drop_column("diary_entries", "edited_by")
    op.drop_column("diary_entries", "edited_at")
    op.drop_column("diary_entries", "is_edited")