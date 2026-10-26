"""add consent_data_sharing_with_doctor

Revision ID: 0035_consent_sharing
Revises: 0034_missing_indexes
Create Date: 2026-10-26
"""

from alembic import op
import sqlalchemy as sa

revision = "0035_consent_sharing"
down_revision = "0034_missing_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "patient_profiles",
        sa.Column(
            "consent_data_sharing_with_doctor",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )


def downgrade() -> None:
    op.drop_column("patient_profiles", "consent_data_sharing_with_doctor")
