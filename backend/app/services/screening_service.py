from __future__ import annotations

from app.core.questionnaire_registry import get_definition


class ScreeningService:
    """Сервис скринингов (backend-driven registry)."""

    @staticmethod
    def _validate_answers(defn, answers: list) -> None:
        if not isinstance(answers, list) or len(answers) != len(defn.questions):
            raise ValueError(f"Ожидается {len(defn.questions)} ответов")
        allowed = {opt.value for opt in defn.answer_scale}
        for i, value in enumerate(answers):
            if isinstance(value, bool):
                raise ValueError("Недопустимое значение ответа")
            if value is None:
                raise ValueError("Пропущенный ответ недопустим: все вопросы обязательны")
            if not isinstance(value, int):
                raise ValueError("Недопустимое значение ответа")
            q = defn.questions[i]
            if q.max_value is not None:
                if value < 0 or value > q.max_value:
                    raise ValueError("Недопустимое значение ответа")
            else:
                if value not in allowed:
                    raise ValueError("Недопустимое значение ответа")

    @staticmethod
    def score(defn, answers: list) -> int:
        ScreeningService._validate_answers(defn, answers)
        return int(sum(value for value in answers if value is not None))

    async def create_screening(self, db, current_user, data: dict):
        from app.repositories.screening_repository import ScreeningRepository
        from app.core.errors import not_found
        from app.models.profile import PatientProfile
        from sqlalchemy import select

        profile = (await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))).scalar_one_or_none()
        if profile is None:
            raise not_found("Профиль пациента не найден")

        code = data["questionnaire_type"]
        version = data.get("questionnaire_version", "1.0")
        defn = get_definition(code, version)
        if defn is None:
            raise ValueError("Неизвестный опросник или версия")

        answers_payload = data["answers"]
        answers = []
        if answers_payload and isinstance(answers_payload[0], dict):
            for item in answers_payload:
                skipped = bool(item.get("skipped", False))
                value = item.get("value", None)
                if skipped or value is None:
                    answers.append(None)
                else:
                    answers.append(int(value))
        else:
            for v in answers_payload:
                answers.append(None if v is None else int(v))

        score = self.score(defn, answers)
        severity = defn.severity_for(score)
        is_critical = False
        critical_reason = None
        rules = defn.critical_rules or {}
        if "total_threshold" in rules and score >= rules["total_threshold"]:
            is_critical = True
            critical_reason = "high_total_score"
        if "item_index" in rules:
            idx = rules["item_index"]
            thr = rules.get("item_threshold", 1)
            if len(answers) > idx and answers[idx] >= thr:
                is_critical = True
                critical_reason = "suicidal_ideation_item" if critical_reason is None else f"{critical_reason};suicidal_ideation_item"

        repo = ScreeningRepository()
        row = await repo.create_screening(
            db=db,
            patient_id=str(profile.id),
            questionnaire_type=code,
            questionnaire_version=defn.version,
            score=score,
            answers=data["answers"],
            is_critical=is_critical,
            severity=severity,
            critical_reason=critical_reason,
        )
        result = {
            "id": str(row.id),
            "patient_id": str(row.patient_id),
            "questionnaire_type": row.questionnaire_type,
            "questionnaire_code": code,
            "questionnaire_version": row.questionnaire_version,
            "score": row.score,
            "answers": row.answers,
            "is_critical": row.is_critical,
            "severity": row.severity,
            "critical_reason": row.critical_reason,
            "interpretation": severity,
            "created_at": row.created_at.isoformat() if getattr(row, "created_at", None) else None,
        }
        # generate alerts (Phase 10)
        try:
            from app.services.alert_service import AlertService
            await AlertService().generate_alerts_for_screening(db, result)
        except Exception:
            import logging
            logging.getLogger(__name__).exception('alert generation failed')
        return result

    # Backward-compatible helpers (Phase 9.1 API)
    @staticmethod
    def score_phq9(answers):
        from app.core.questionnaire_registry import get_definition
        return ScreeningService.score(get_definition("phq9", "1.0"), answers)

    @staticmethod
    def score_gad7(answers):
        from app.core.questionnaire_registry import get_definition
        return ScreeningService.score(get_definition("gad7", "1.0"), answers)

    @staticmethod
    def interpret_phq9(score):
        from app.core.questionnaire_registry import get_definition
        defn = get_definition("phq9", "1.0")
        return defn.severity_for(score) if defn is not None else "unknown"

    @staticmethod
    def interpret_gad7(score):
        from app.core.questionnaire_registry import get_definition
        defn = get_definition("gad7", "1.0")
        return defn.severity_for(score) if defn is not None else "unknown"

    @staticmethod
    def is_critical_phq9(answers, score):
        defn = __import__("app.core.questionnaire_registry", fromlist=["get_definition"]).get_definition("phq9", "1.0")
        rules = defn.critical_rules
        if "total_threshold" in rules and score >= rules["total_threshold"]:
            return True
        if "item_index" in rules:
            idx = rules["item_index"]
            thr = rules.get("item_threshold", 1)
            if len(answers) > idx and answers[idx] >= thr:
                return True
        return False

    @staticmethod
    def is_critical_gad7(score):
        defn = __import__("app.core.questionnaire_registry", fromlist=["get_definition"]).get_definition("gad7", "1.0")
        rules = defn.critical_rules
        return "total_threshold" in rules and score >= rules["total_threshold"]
