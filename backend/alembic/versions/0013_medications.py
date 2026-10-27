"""Migration 0013: medications, prescriptions, medication_adherence."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0013_medications"
down_revision: str | None = "0012_integration_events"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "medications",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("international_name", sa.String(255)),
        sa.Column("dosage_form", sa.String(100)),
        sa.Column("strength", sa.String(100)),
        sa.Column("manufacturer", sa.String(255)),
        sa.Column("instructions_url", sa.String(500)),
        sa.Column("contraindications", sa.Text),
        sa.Column("side_effects", sa.Text),
        sa.Column("interactions", sa.Text),
        sa.Column("patient_instruction", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_medications_name", "medications", ["name"])
    op.create_index("idx_medications_international_name", "medications", ["international_name"])

    op.create_table(
        "prescriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("practitioner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("medication_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("medications.id", ondelete="CASCADE"), nullable=False),
        sa.Column("dosage", sa.String(100), nullable=False),
        sa.Column("frequency", sa.String(255), nullable=False),
        sa.Column("start_date", sa.Date, nullable=False),
        sa.Column("end_date", sa.Date, nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_check_constraint("ck_prescriptions_dates", "prescriptions", "end_date >= start_date")
    op.create_index("idx_prescriptions_patient_id", "prescriptions", ["patient_id"])
    op.create_index("idx_prescriptions_practitioner_id", "prescriptions", ["practitioner_id"])
    op.create_index("idx_prescriptions_medication_id", "prescriptions", ["medication_id"])

    op.create_table(
        "medication_adherence",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("prescription_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("taken_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_taken", sa.Boolean, nullable=False),
        sa.Column("note", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_unique_constraint("uq_medication_adherence_prescription_taken", "medication_adherence", ["prescription_id", "taken_at"])
    op.create_index("idx_medication_adherence_prescription_id", "medication_adherence", ["prescription_id"])


def downgrade() -> None:
    op.drop_index("idx_medication_adherence_prescription_id", table_name="medication_adherence")
    op.drop_constraint("uq_medication_adherence_prescription_taken", "medication_adherence", type_="unique")
    op.drop_table("medication_adherence")
    op.drop_index("idx_prescriptions_medication_id", table_name="prescriptions")
    op.drop_index("idx_prescriptions_practitioner_id", table_name="prescriptions")
    op.drop_index("idx_prescriptions_patient_id", table_name="prescriptions")
    op.drop_constraint("ck_prescriptions_dates", "prescriptions", type_="check")
    op.drop_table("prescriptions")
    op.drop_index("idx_medications_international_name", table_name="medications")
    op.drop_index("idx_medications_name", table_name="medications")
    op.drop_table("medications")
