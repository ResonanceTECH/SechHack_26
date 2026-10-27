"""Migration 0021: medication adherence corrections."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0021_med_adh_corr"
down_revision: str | None = "0020_diary_updated_at"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("medication_adherence", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.add_column("medication_adherence", sa.Column("corrected_at", sa.DateTime(timezone=True)))
    op.add_column("medication_adherence", sa.Column("corrected_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")))
    op.add_column("medication_adherence", sa.Column("correction_reason", sa.Text()))


def downgrade() -> None:
    op.drop_column("medication_adherence", "correction_reason")
    op.drop_column("medication_adherence", "corrected_by")
    op.drop_column("medication_adherence", "corrected_at")
    op.drop_column("medication_adherence", "updated_at")
