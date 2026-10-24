"""Migration 0017: appointments."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0017_appointments"
down_revision: str | None = "0016_messages"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "appointments",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("practitioner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default=sa.text("'scheduled'")),
        sa.Column("reason", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.CheckConstraint("status IN ('scheduled','completed','cancelled','no_show')", name="ck_appointments_status"),
    )
    op.create_index("idx_appointments_patient_id_scheduled_at", "appointments", ["patient_id", "scheduled_at"])
    op.create_index("idx_appointments_practitioner_id_scheduled_at", "appointments", ["practitioner_id", "scheduled_at"])
    op.create_index("idx_appointments_status", "appointments", ["status"])


def downgrade() -> None:
    op.drop_index("idx_appointments_status", table_name="appointments")
    op.drop_index("idx_appointments_practitioner_id_scheduled_at", table_name="appointments")
    op.drop_index("idx_appointments_patient_id_scheduled_at", table_name="appointments")
    op.drop_table("appointments")