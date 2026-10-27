"""Migration 0036: RLS policies migrated to multi-clinic context (list of clinic ids)."""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "0036_rls_multi_clinic"
down_revision: str | None = "0035_consent_sharing"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None

CLINIC_LINKED_TABLES = ["patient_profiles", "clinic_settings"]
MEMBERSHIP_TABLES = ["practitioner_clinic_memberships"]

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


def _clinic_policy_using() -> str:
    return (
        "clinic_id IS NULL\n"
        "        OR NULLIF(current_setting('app.current_clinic_ids', true), '') IS NULL\n"
        "        OR clinic_id = ANY(\n"
        "            string_to_array(NULLIF(current_setting('app.current_clinic_ids', true), ''), ',')::uuid[]\n"
        "        )"
    )


def _patient_policy_using() -> str:
    return (
        "patient_id IS NULL\n"
        "        OR NULLIF(current_setting('app.current_clinic_ids', true), '') IS NULL\n"
        "        OR patient_id IN (\n"
        "            SELECT id FROM patient_profiles\n"
        "            WHERE clinic_id IS NULL\n"
        "               OR clinic_id = ANY(\n"
        "                   string_to_array(NULLIF(current_setting('app.current_clinic_ids', true), ''), ',')::uuid[]\n"
        "               )\n"
        "        )"
    )


def _single_clinic_policy() -> str:
    return (
        "clinic_id IS NULL\n"
        "        OR NULLIF(current_setting('app.current_clinic_id', true), '') IS NULL\n"
        "        OR clinic_id = NULLIF(current_setting('app.current_clinic_id', true), '')::uuid"
    )


def _single_patient_policy() -> str:
    return (
        "patient_id IS NULL\n"
        "        OR NULLIF(current_setting('app.current_clinic_id', true), '') IS NULL\n"
        "        OR patient_id IN (\n"
        "            SELECT id FROM patient_profiles\n"
        "            WHERE clinic_id IS NULL\n"
        "               OR clinic_id = NULLIF(current_setting('app.current_clinic_id', true), '')::uuid\n"
        "        )"
    )


def upgrade() -> None:
    for table in CLINIC_LINKED_TABLES + MEMBERSHIP_TABLES:
        policy = f"clinic_isolation_{table}"
        op.execute(f"DROP POLICY IF EXISTS {policy} ON {table}")
        op.execute(
            f"CREATE POLICY {policy} ON {table} USING ({_clinic_policy_using()})"
        )
    for table in PATIENT_LINKED_TABLES:
        policy = f"clinic_isolation_{table}"
        op.execute(f"DROP POLICY IF EXISTS {policy} ON {table}")
        op.execute(
            f"CREATE POLICY {policy} ON {table} USING ({_patient_policy_using()})"
        )


def downgrade() -> None:
    for table in PATIENT_LINKED_TABLES:
        policy = f"clinic_isolation_{table}"
        op.execute(f"DROP POLICY IF EXISTS {policy} ON {table}")
        op.execute(
            f"CREATE POLICY {policy} ON {table} USING ({_single_patient_policy()})"
        )
    for table in CLINIC_LINKED_TABLES + MEMBERSHIP_TABLES:
        policy = f"clinic_isolation_{table}"
        op.execute(f"DROP POLICY IF EXISTS {policy} ON {table}")
        op.execute(
            f"CREATE POLICY {policy} ON {table} USING ({_single_clinic_policy()})"
        )