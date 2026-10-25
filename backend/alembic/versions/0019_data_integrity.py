"""Migration 0019: data integrity (updated_at, message edit metadata)."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0019_data_integrity"
down_revision: str | None = "0018_schedule"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("messages", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.add_column("messages", sa.Column("edited_at", sa.DateTime(timezone=True)))
    op.add_column("messages", sa.Column("edited_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")))
    op.add_column("messages", sa.Column("is_edited", sa.Boolean(), server_default=sa.text("false"), nullable=False))

    op.add_column("crisis_signals", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))


def downgrade() -> None:
    op.drop_column("crisis_signals", "updated_at")
    op.drop_column("messages", "is_edited")
    op.drop_column("messages", "edited_by")
    op.drop_column("messages", "edited_at")
    op.drop_column("messages", "updated_at")
