"""Migration 0018: schedule and clinic settings."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0018_schedule"
down_revision: str | None = "0017_appointments"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "clinic_settings",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("timezone", sa.String(64), nullable=False, server_default=sa.text("'Europe/Moscow'")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_clinic_settings_clinic_id", "clinic_settings", ["clinic_id"], unique=True)

    op.create_table(
        "practitioner_schedules",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("practitioner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("weekday", sa.Integer, nullable=False),
        sa.Column("start_time", sa.Time, nullable=False),
        sa.Column("end_time", sa.Time, nullable=False),
        sa.Column("is_available", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_practitioner_schedules_practitioner_id", "practitioner_schedules", ["practitioner_id"])

    op.create_table(
        "practitioner_schedule_exceptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("practitioner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("start_time", sa.Time),
        sa.Column("end_time", sa.Time),
        sa.Column("is_available", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("reason", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_practitioner_schedule_exceptions_practitioner_id", "practitioner_schedule_exceptions", ["practitioner_id"])


def downgrade() -> None:
    op.drop_index("idx_practitioner_schedule_exceptions_practitioner_id", table_name="practitioner_schedule_exceptions")
    op.drop_table("practitioner_schedule_exceptions")
    op.drop_index("idx_practitioner_schedules_practitioner_id", table_name="practitioner_schedules")
    op.drop_table("practitioner_schedules")
    op.drop_index("idx_clinic_settings_clinic_id", table_name="clinic_settings")
    op.drop_table("clinic_settings")
