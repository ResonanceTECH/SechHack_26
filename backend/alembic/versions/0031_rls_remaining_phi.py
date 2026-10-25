"""Migration 0031: RLS for remaining patient-linked PHI tables."""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "0031_rls_remaining_phi"
down_revision: str | None = "0030_rls_settings_memberships"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None

# Tables that carry a direct patient_id FK to patient_profiles.
PATIENT_LINKED_TABLES = [
    "screening_results",
    "diary_entries",
    "care_plans",
    "exercise_completions",
    "alerts",
    "prescriptions",
    "safety_plans",
    "crisis_signals",
    "patient_assignments",
    "assessment_plans",
    "appointments",
    "patient_name_history",
    "messages",
]


def _enable(table: str) -> None:
    policy = f"clinic_isolation_{table}"
    op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
    op.execute(
        f"""
        CREATE POLICY {policy} ON {table}
        USING (
            patient_id IS NULL
            OR NULLIF(current_setting('app.current_clinic_id', true), '') IS NULL
            OR patient_id IN (
                SELECT id FROM patient_profiles
                WHERE clinic_id IS NULL
                   OR clinic_id = NULLIF(current_setting('app.current_clinic_id', true), '')::uuid
            )
        )
        """
    )
    op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")


def _disable(table: str) -> None:
    policy = f"clinic_isolation_{table}"
    op.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
    op.execute(f"DROP POLICY IF EXISTS {policy} ON {table}")
    op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")


def upgrade() -> None:
    for table in PATIENT_LINKED_TABLES:
        _enable(table)


def downgrade() -> None:
    for table in reversed(PATIENT_LINKED_TABLES):
        _disable(table)