"""Миграция 0007: таблица diagnosis_references."""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0007_diagnosis_references"
down_revision: str | None = "0006_patient_diagnoses"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "diagnosis_references",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("coding_system", sa.String(10), nullable=False),
        sa.Column("code", sa.String(30), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("title_en", sa.String(255), nullable=True),
        sa.Column("chapter", sa.String(255), nullable=True),
        sa.Column("parent_code", sa.String(30), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("version", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_check_constraint(
        "ck_diagnosis_references_coding_system",
        "diagnosis_references",
        "coding_system IN ('ICD10','ICD11')",
    )
    op.create_unique_constraint(
        "uq_diagnosis_references_coding_system_code",
        "diagnosis_references",
        ["coding_system", "code"],
    )
    op.create_index("idx_diagnosis_references_coding_system", "diagnosis_references", ["coding_system"])
    op.create_index("idx_diagnosis_references_code", "diagnosis_references", ["code"])

    # Seed базового справочника (подмножество)
    ref_table = sa.table(
        "diagnosis_references",
        sa.column("coding_system", sa.String),
        sa.column("code", sa.String),
        sa.column("title", sa.String),
        sa.column("title_en", sa.String),
        sa.column("chapter", sa.String),
        sa.column("version", sa.String),
    )
    icd10_seed = [
        ("ICD10", "F00", "Деменция при болезни Альцгеймера", "Dementia in Alzheimer disease", "F00-F09", "ICD-10"),
        ("ICD10", "F06", "Другие психические расстройства, обусловленные повреждением и дисфункцией головного мозга", "Other mental disorders due to brain damage", "F00-F09", "ICD-10"),
        ("ICD10", "F20", "Шизофрения", "Schizophrenia", "F20-F29", "ICD-10"),
        ("ICD10", "F32", "Депрессивный эпизод", "Depressive episode", "F30-F39", "ICD-10"),
        ("ICD10", "F33", "Рекуррентное депрессивное расстройство", "Recurrent depressive disorder", "F30-F39", "ICD-10"),
        ("ICD10", "F41", "Другие тревожные расстройства", "Other anxiety disorders", "F40-F48", "ICD-10"),
        ("ICD10", "F43", "Реакция на тяжёлый стресс и нарушения адаптации", "Reaction to severe stress and adjustment disorders", "F40-F48", "ICD-10"),
        ("ICD10", "F90", "Гиперкинетические расстройства", "Hyperkinetic disorders", "F90-F98", "ICD-10"),
    ]
    icd11_seed = [
        ("ICD11", "6A70", "Генерализованное тревожное расстройство", "Generalized anxiety disorder", "6A70", "ICD-11"),
        ("ICD11", "6A71", "Паническое расстройство", "Panic disorder", "6A71", "ICD-11"),
        ("ICD11", "6A80", "Биполярное расстройство I типа, текущий эпизод мании", "Bipolar type I disorder, current episode manic", "6A80", "ICD-11"),
        ("ICD11", "6B00", "Обсессивно-компульсивное расстройство", "Obsessive-compulsive disorder", "6B00", "ICD-11"),
    ]
    op.bulk_insert(ref_table, [
        {"coding_system": c, "code": code, "title": title, "title_en": title_en, "chapter": chapter, "version": version}
        for (c, code, title, title_en, chapter, version) in (icd10_seed + icd11_seed)
    ])


def downgrade() -> None:
    op.drop_index("idx_diagnosis_references_code", table_name="diagnosis_references")
    op.drop_index("idx_diagnosis_references_coding_system", table_name="diagnosis_references")
    op.drop_constraint("uq_diagnosis_references_coding_system_code", "diagnosis_references", type_="unique")
    op.drop_constraint("ck_diagnosis_references_coding_system", "diagnosis_references", type_="check")
    op.drop_table("diagnosis_references")