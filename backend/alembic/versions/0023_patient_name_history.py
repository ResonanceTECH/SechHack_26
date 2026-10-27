"""Migration 0023: patient name history (strict clinical history)."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0023_patient_name_history"
down_revision: str | None = "0022_practitioner_name_history"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "patient_name_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False),
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
    op.create_index("idx_patient_name_history_patient_id", "patient_name_history", ["patient_id"])
    op.create_index("idx_patient_name_history_changed_at", "patient_name_history", ["changed_at"])


def downgrade() -> None:
    op.drop_index("idx_patient_name_history_changed_at", table_name="patient_name_history")
    op.drop_index("idx_patient_name_history_patient_id", table_name="patient_name_history")
    op.drop_table("patient_name_history")