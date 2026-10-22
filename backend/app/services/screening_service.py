from __future__ import annotations

from app.core.questionnaires import QUESTIONNAIRES


class ScreeningService:
    """Сервис скринингов PHQ-9 / GAD-7 (серверный подсчёт балла)."""

    @staticmethod
    def _validate_answers(answers: list[int], expected_count: int) -> None:
        if not isinstance(answers, list) or len(answers) != expected_count:
            raise ValueError(f"Ожидается {expected_count} ответов")
        for value in answers:
            if not isinstance(value, int) or isinstance(value, bool) or value < 0 or value > 3:
                raise ValueError("Ответ должен быть целым числом от 0 до 3")

    @staticmethod
    def score_phq9(answers: list[int]) -> int:
        ScreeningService._validate_answers(answers, QUESTIONNAIRES["phq9"]["questions_count"])
        return int(sum(answers))

    @staticmethod
    def score_gad7(answers: list[int]) -> int:
        ScreeningService._validate_answers(answers, QUESTIONNAIRES["gad7"]["questions_count"])
        return int(sum(answers))

    @staticmethod
    def interpret_phq9(score: int) -> str:
        if score <= 4:
            return "минимальная"
        if score <= 9:
            return "лёгкая"
        if score <= 14:
            return "умеренная"
        if score <= 19:
            return "умеренно выраженная"
        return "тяжёлая"

    @staticmethod
    def interpret_gad7(score: int) -> str:
        if score <= 4:
            return "минимальная"
        if score <= 9:
            return "лёгкая"
        if score <= 14:
            return "умеренная"
        return "тяжёлая"

    @staticmethod
    def is_critical_phq9(answers: list[int], score: int) -> bool:
        ScreeningService._validate_answers(answers, QUESTIONNAIRES["phq9"]["questions_count"])
        if score >= 20:
            return True
        return len(answers) >= 9 and answers[8] >= 1

    @staticmethod
    def is_critical_gad7(score: int) -> bool:
        return score >= 15

    async def create_screening(self, db, current_user, data: dict):
        from uuid import UUID
        from app.repositories.screening_repository import ScreeningRepository
        from app.core.errors import forbidden, not_found
        from app.models.profile import PatientProfile
        from sqlalchemy import select

        # resolve patient profile for current user
        profile = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))).scalar_one_or_none()
        if profile is None:
            raise not_found("Профиль пациента не найден")

        qtype = data["questionnaire_type"]
        if qtype not in QUESTIONNAIRES:
            raise ValueError("Неизвестный тип опросника")

        answers_payload = data["answers"]
        # accept list of {question_id, value} or list of ints
        if answers_payload and isinstance(answers_payload[0], dict):
            answers = [int(item["value"]) for item in answers_payload]
        else:
            answers = [int(v) for v in answers_payload]

        if qtype == "phq9":
            score = self.score_phq9(answers)
            is_critical = self.is_critical_phq9(answers, score)
            interpretation = self.interpret_phq9(score)
        else:
            score = self.score_gad7(answers)
            is_critical = self.is_critical_gad7(score)
            interpretation = self.interpret_gad7(score)

        repo = ScreeningRepository()
        row = await repo.create_screening(
            db=db,
            patient_id=str(profile.id),
            questionnaire_type=qtype,
            questionnaire_version=data.get("questionnaire_version", QUESTIONNAIRES[qtype]["version"]),
            score=score,
            answers=data["answers"],
            is_critical=is_critical,
        )
        result = {
            "id": str(row.id),
            "patient_id": str(row.patient_id),
            "questionnaire_type": row.questionnaire_type,
            "questionnaire_version": row.questionnaire_version,
            "score": row.score,
            "answers": row.answers,
            "is_critical": row.is_critical,
            "interpretation": interpretation,
            "created_at": row.created_at.isoformat() if getattr(row, "created_at", None) else None,
        }
        return result
