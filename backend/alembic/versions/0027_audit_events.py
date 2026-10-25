"""Migration 0027: audit events for security/PHI access."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0027_audit_events"
down_revision: str | None = "0026_message_soft_delete"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "audit_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("actor_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("actor_role", sa.String(50)),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id", ondelete="SET NULL")),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_profiles.id", ondelete="SET NULL")),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource_type", sa.String(100), nullable=False),
        sa.Column("resource_id", sa.String(255)),
        sa.Column("result", sa.String(30), nullable=False, server_default=sa.text("'allowed'")),
        sa.Column("request_id", sa.String(100)),
        sa.Column("ip_address", sa.String(64)),
        sa.Column("user_agent", sa.Text()),
        sa.Column("details", postgresql.JSONB(astext_type=sa.Text())),
    )
    op.create_index("idx_audit_events_occurred_at", "audit_events", ["occurred_at"])
    op.create_index("idx_audit_events_actor_user_id", "audit_events", ["actor_user_id"])
    op.create_index("idx_audit_events_clinic_id", "audit_events", ["clinic_id"])
    op.create_index("idx_audit_events_patient_id", "audit_events", ["patient_id"])
    op.create_index("idx_audit_events_result", "audit_events", ["result"])


def downgrade() -> None:
    op.drop_index("idx_audit_events_result", table_name="audit_events")
    op.drop_index("idx_audit_events_patient_id", table_name="audit_events")
    op.drop_index("idx_audit_events_clinic_id", table_name="audit_events")
    op.drop_index("idx_audit_events_actor_user_id", table_name="audit_events")
    op.drop_index("idx_audit_events_occurred_at", table_name="audit_events")
    op.drop_table("audit_events")