"""Migration 0034: add missing composite indexes for chat/alert/screening queries.

Adds indexes identified in AUDIT_PRE_FRONTEND_INTEGRATION.md §18.3:
- messages(recipient_id, created_at) — chat history pagination (conversation_id column does not exist; recipient_id is the equivalent access path)
- alerts(patient_id, status, created_at) — alert dashboard queries
- screening_results(patient_id, questionnaire_code) — patient screening history

audit_logs(entity_type, entity_id) already exists in app/models/audit.py.
diary_entries(patient_id, recorded_at) already exists in app/models/clinical.py.
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0034_missing_indexes"
down_revision: str | None = "0033_updated_at_coverage"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(
        "idx_messages_recipient_created_at",
        "messages",
        ["recipient_id", "created_at"],
    )
    op.create_index(
        "idx_alerts_patient_status_created_at",
        "alerts",
        ["patient_id", "status", "created_at"],
    )
    op.create_index(
        "idx_screening_results_patient_questionnaire",
        "screening_results",
        ["patient_id", "questionnaire_type"],
    )


def downgrade() -> None:
    op.drop_index(
        "idx_screening_results_patient_questionnaire",
        table_name="screening_results",
    )
    op.drop_index(
        "idx_alerts_patient_status_created_at",
        table_name="alerts",
    )
    op.drop_index(
        "idx_messages_recipient_created_at",
        table_name="messages",
    )
