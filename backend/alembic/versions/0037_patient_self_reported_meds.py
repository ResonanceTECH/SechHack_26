"""Migration 0037: patient self-reported medications and allergies."""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0037_patient_self_reported_meds"
down_revision: str | None = "0036_rls_multi_clinic"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("patient_profiles", sa.Column("current_medications", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("patient_profiles", sa.Column("allergy_status", sa.String(length=20), nullable=True))
    op.add_column("patient_profiles", sa.Column("taking_no_medications", sa.Boolean(), nullable=False, server_default=sa.text("false")))


def downgrade() -> None:
    op.drop_column("patient_profiles", "taking_no_medications")
    op.drop_column("patient_profiles", "allergy_status")
    op.drop_column("patient_profiles", "current_medications")
