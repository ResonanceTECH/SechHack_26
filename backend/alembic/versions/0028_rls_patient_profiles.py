"""Migration 0028: RLS preparation for patient_profiles (clinic isolation)."""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "0028_rls_patient_profiles"
down_revision: str | None = "0027_audit_events"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY clinic_isolation_patient_profiles ON patient_profiles
        USING (
            clinic_id IS NULL
            OR NULLIF(current_setting('app.current_clinic_id', true), '') IS NULL
            OR clinic_id = NULLIF(current_setting('app.current_clinic_id', true), '')::uuid
        )
        """
    )
    op.execute("ALTER TABLE patient_profiles FORCE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.execute("ALTER TABLE patient_profiles NO FORCE ROW LEVEL SECURITY")
    op.execute("DROP POLICY IF EXISTS clinic_isolation_patient_profiles ON patient_profiles")
    op.execute("ALTER TABLE patient_profiles DISABLE ROW LEVEL SECURITY")