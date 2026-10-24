"""Migration 0016: messages."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0016_messages"
down_revision: str | None = "0015_screening_registry"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("sender_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recipient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_profiles.id", ondelete="SET NULL")),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("is_read", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("read_at", sa.DateTime(timezone=True)),
    )
    op.create_index("idx_messages_sender_id_recipient_id", "messages", ["sender_id", "recipient_id"])
    op.create_index("idx_messages_patient_id", "messages", ["patient_id"])
    op.create_index("idx_messages_is_read", "messages", ["is_read"])


def downgrade() -> None:
    op.drop_index("idx_messages_is_read", table_name="messages")
    op.drop_index("idx_messages_patient_id", table_name="messages")
    op.drop_index("idx_messages_sender_id_recipient_id", table_name="messages")
    op.drop_table("messages")