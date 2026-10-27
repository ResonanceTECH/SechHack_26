"""Миграция 0006: таблица patient_diagnoses."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0006_patient_diagnoses"
down_revision: str | None = "0005_screening_severity_length"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "patient_diagnoses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("coding_system", sa.String(10), nullable=False),
        sa.Column("code", sa.String(30), nullable=False),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("diagnosed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("diagnosed_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_confirmed", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_patient_diagnoses_patient_id", "patient_diagnoses", ["patient_id"])
    op.create_index("idx_patient_diagnoses_status", "patient_diagnoses", ["status"])
    op.create_check_constraint(
        "ck_patient_diagnoses_coding_system",
        "patient_diagnoses",
        "coding_system IN ('ICD10','ICD11')",
    )
    op.create_check_constraint(
        "ck_patient_diagnoses_status",
        "patient_diagnoses",
        "status IN ('active','remission','resolved','closed')",
    )
    op.create_index(
        "uq_patient_diagnoses_primary_active",
        "patient_diagnoses",
        ["patient_id"],
        unique=True,
        postgresql_where=sa.text("is_primary = true AND status = 'active'"),
    )


def downgrade() -> None:
    op.drop_index("uq_patient_diagnoses_primary_active", table_name="patient_diagnoses")
    op.drop_constraint("ck_patient_diagnoses_status", "patient_diagnoses", type_="check")
    op.drop_constraint("ck_patient_diagnoses_coding_system", "patient_diagnoses", type_="check")
    op.drop_index("idx_patient_diagnoses_status", table_name="patient_diagnoses")
    op.drop_index("idx_patient_diagnoses_patient_id", table_name="patient_diagnoses")
    op.drop_table("patient_diagnoses")
