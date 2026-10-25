"""Migration 0029: practitioner clinic memberships (multi-clinic support)."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0029_clinic_memberships"
down_revision: str | None = "0028_rls_patient_profiles"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "practitioner_clinic_memberships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "practitioner_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "clinic_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("clinics.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("role_in_clinic", sa.String(50), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index(
        "idx_practitioner_clinic_memberships_practitioner_id",
        "practitioner_clinic_memberships",
        ["practitioner_id"],
    )
    op.create_index(
        "idx_practitioner_clinic_memberships_clinic_id",
        "practitioner_clinic_memberships",
        ["clinic_id"],
    )
    op.create_unique_constraint(
        "uq_practitioner_clinic_memberships_practitioner_clinic",
        "practitioner_clinic_memberships",
        ["practitioner_id", "clinic_id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_practitioner_clinic_memberships_practitioner_clinic",
        "practitioner_clinic_memberships",
        type_="unique",
    )
    op.drop_index(
        "idx_practitioner_clinic_memberships_clinic_id",
        table_name="practitioner_clinic_memberships",
    )
    op.drop_index(
        "idx_practitioner_clinic_memberships_practitioner_id",
        table_name="practitioner_clinic_memberships",
    )
    op.drop_table("practitioner_clinic_memberships")