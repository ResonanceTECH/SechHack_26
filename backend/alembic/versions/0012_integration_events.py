"""Migration 0012: integration_events (universal API connector backbone)."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0012_integration_events"
down_revision: str | None = "0011_diary_entries"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "integration_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("source_system", sa.String(50), nullable=False),
        sa.Column("target_system", sa.String(50), nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("idempotency_key", sa.String(128), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("payload", postgresql.JSONB, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("response", postgresql.JSONB, nullable=True),
        sa.Column("retry_count", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("next_retry_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_integration_events_status_created_at", "integration_events", ["status", "created_at"])
    op.create_index("idx_integration_events_idempotency_key", "integration_events", ["idempotency_key"], unique=True)
    op.create_index("idx_integration_events_target_system", "integration_events", ["target_system"])


def downgrade() -> None:
    op.drop_index("idx_integration_events_target_system", table_name="integration_events")
    op.drop_index("idx_integration_events_idempotency_key", table_name="integration_events")
    op.drop_index("idx_integration_events_status_created_at", table_name="integration_events")
    op.drop_table("integration_events")