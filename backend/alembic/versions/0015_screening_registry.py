"""Миграция 0015: расширить ограничение диапазона баллов скрининга на все коды реестра."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0015_screening_registry"
down_revision: str | None = "0014_screening_ymrs"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("chk_screening_score_range", "screening_results", type_="check")
    op.create_check_constraint(
        "chk_screening_score_range",
        "screening_results",
        "(questionnaire_type = 'phq9' AND score <= 27) OR "
        "(questionnaire_type = 'gad7' AND score <= 21) OR "
        "(questionnaire_type = 'ymrs' AND score <= 60) OR "
        "(questionnaire_type = 'hcl8' AND score <= 8) OR "
        "(questionnaire_type = 'pdss' AND score <= 28) OR "
        "(questionnaire_type = 'cssrs' AND score <= 6) OR "
        "(questionnaire_type = 'isi' AND score <= 28) OR "
        "(questionnaire_type = 'hcl33' AND score <= 33)",
    )


def downgrade() -> None:
    op.drop_constraint("chk_screening_score_range", "screening_results", type_="check")
    op.create_check_constraint(
        "chk_screening_score_range",
        "screening_results",
        "(questionnaire_type = 'phq9' AND score <= 27) OR "
        "(questionnaire_type = 'gad7' AND score <= 21) OR "
        "(questionnaire_type = 'ymrs' AND score <= 60)",
    )
