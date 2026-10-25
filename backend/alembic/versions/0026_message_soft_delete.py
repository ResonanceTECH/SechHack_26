"""Migration 0026: message soft delete (retention policy)."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0026_message_soft_delete"
down_revision: str | None = "0025_diary_entry_versions"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("messages", sa.Column("deleted_at", sa.DateTime(timezone=True)))
    op.add_column("messages", sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")))


def downgrade() -> None:
    op.drop_column("messages", "is_deleted")
    op.drop_column("messages", "deleted_at")