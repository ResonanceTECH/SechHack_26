"""Миграция 0014: добавить YMRS в ограничение диапазона баллов скрининга."""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0014_screening_ymrs"
down_revision: str | None = "0013_medications"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("chk_screening_score_range", "screening_results", type_="check")
    op.create_check_constraint(
        "chk_screening_score_range",
        "screening_results",
        "(questionnaire_type = 'phq9' AND score <= 27) OR "
        "(questionnaire_type = 'gad7' AND score <= 21) OR "
        "(questionnaire_type = 'ymrs' AND score <= 60)",
    )


def downgrade() -> None:
    op.drop_constraint("chk_screening_score_range", "screening_results", type_="check")
    op.create_check_constraint(
        "chk_screening_score_range",
        "screening_results",
        "(questionnaire_type = 'phq9' AND score <= 27) OR "
        "(questionnaire_type = 'gad7' AND score <= 21)",
    )