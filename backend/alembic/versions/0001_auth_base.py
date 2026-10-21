"""Начальная схема auth-контура concept01 (по DB_SCHEMA.md §1).

Таблицы: users, clinics, patient_profiles, practitioner_profiles,
refresh_tokens, sms_codes, invite_codes, patient_assignments, audit_logs.

Revision ID: 0001_auth_base
Revises:
Create Date: 2026-10-20

"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0001_auth_base"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("email", sa.String(255), unique=True),
        sa.Column("phone", sa.String(30), unique=True),
        sa.Column("phone_verified", sa.Boolean, server_default=sa.text("false")),
        sa.Column("password_hash", sa.String(255)),
        sa.Column("role", sa.String(50), nullable=False),
        sa.Column("is_active", sa.Boolean, server_default=sa.text("true")),
        sa.Column("token_version", sa.Integer, nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("last_login_at", sa.DateTime(timezone=True)),
        sa.CheckConstraint(
            "role IN ('patient','doctor','psychologist','coordinator','clinic_admin','super_admin')",
            name="ck_users_role",
        ),
    )
    op.create_index("idx_users_role", "users", ["role"])

    op.create_table(
        "clinics",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("address", sa.Text),
        sa.Column("inn", sa.String(20)),
        sa.Column("is_active", sa.Boolean, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_clinics_name", "clinics", ["name"])

    op.create_table(
        "patient_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("middle_name", sa.String(100)),
        sa.Column("birth_date", sa.Date),
        sa.Column("gender", sa.String(30)),
        sa.Column("phone", sa.String(30)),
        sa.Column("consent_personal_data", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("consent_medical_data", sa.Boolean, nullable=False, server_default=sa.text("false")),
        sa.Column("consent_data_processing_at", sa.DateTime(timezone=True)),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.CheckConstraint(
            "gender IN ('male','female','other','prefer_not_to_say')",
            name="ck_patient_profiles_gender",
        ),
    )
    op.create_index("idx_patient_profiles_clinic_id", "patient_profiles", ["clinic_id"])
    op.create_index("idx_patient_profiles_user_id", "patient_profiles", ["user_id"])

    op.create_table(
        "practitioner_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("middle_name", sa.String(100)),
        sa.Column("specialization", sa.String(50), nullable=False),
        sa.Column("license_number", sa.String(100)),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("is_active", sa.Boolean, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.CheckConstraint(
            "specialization IN ('psychiatrist','psychotherapist','psychologist','nurse','registrar')",
            name="ck_practitioner_profiles_specialization",
        ),
    )
    op.create_index("idx_practitioner_profiles_clinic_id", "practitioner_profiles", ["clinic_id"])

    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True)),
        sa.Column("replaced_by_token_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("refresh_tokens.id")),
        sa.Column("device_info", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
    op.create_index("idx_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"], unique=True)

    op.create_table(
        "sms_codes",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("phone", sa.String(30), nullable=False),
        sa.Column("code_hash", sa.String(255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_used", sa.Boolean, server_default=sa.text("false")),
        sa.Column("attempts", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_sms_codes_phone", "sms_codes", ["phone"])

    op.create_table(
        "invite_codes",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("code", sa.String(20), nullable=False, unique=True),
        sa.Column("practitioner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_multi_use", sa.Boolean, server_default=sa.text("false")),
        sa.Column("max_uses", sa.Integer, server_default=sa.text("1")),
        sa.Column("uses_count", sa.Integer, nullable=False, server_default=sa.text("0")),
        sa.Column("is_active", sa.Boolean, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_invite_codes_practitioner_id", "invite_codes", ["practitioner_id"])
    op.create_index("idx_invite_codes_is_active", "invite_codes", ["is_active"])

    op.create_table(
        "patient_assignments",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("practitioner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("practitioner_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("is_active", sa.Boolean, server_default=sa.text("true")),
        sa.Column("assigned_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.UniqueConstraint("patient_id", "practitioner_id", "clinic_id", name="uq_patient_assignment"),
    )
    op.create_index("idx_patient_assignments_patient_id", "patient_assignments", ["patient_id"])
    op.create_index("idx_patient_assignments_practitioner_id", "patient_assignments", ["practitioner_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("old_values", postgresql.JSONB),
        sa.Column("new_values", postgresql.JSONB),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_audit_logs_user_id_created_at", "audit_logs", ["user_id", "created_at"])
    op.create_index("idx_audit_logs_entity_type_entity_id", "audit_logs", ["entity_type", "entity_id"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("patient_assignments")
    op.drop_table("invite_codes")
    op.drop_table("sms_codes")
    op.drop_table("refresh_tokens")
    op.drop_table("practitioner_profiles")
    op.drop_table("patient_profiles")
    op.drop_table("clinics")
    op.drop_table("users")
