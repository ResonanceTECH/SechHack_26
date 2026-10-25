"""Migration 0030: RLS for clinic_settings and practitioner_clinic_memberships."""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "0030_rls_settings_memberships"
down_revision: str | None = "0029_clinic_memberships"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def _enable(table: str, policy: str) -> None:
    op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
    op.execute(
        f"""
        CREATE POLICY {policy} ON {table}
        USING (
            clinic_id IS NULL
            OR NULLIF(current_setting('app.current_clinic_id', true), '') IS NULL
            OR clinic_id = NULLIF(current_setting('app.current_clinic_id', true), '')::uuid
        )
        """
    )
    op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")


def _disable(table: str, policy: str) -> None:
    op.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
    op.execute(f"DROP POLICY IF EXISTS {policy} ON {table}")
    op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")


def upgrade() -> None:
    _enable("clinic_settings", "clinic_isolation_clinic_settings")
    _enable("practitioner_clinic_memberships", "clinic_isolation_practitioner_clinic_memberships")


def downgrade() -> None:
    _disable("practitioner_clinic_memberships", "clinic_isolation_practitioner_clinic_memberships")
    _disable("clinic_settings", "clinic_isolation_clinic_settings")
