from fastapi import APIRouter, Depends, Request, status

from app.api.dependencies import CurrentUser, DbSession, require_permission
from app.schemas.common import EnvelopeResponse
from app.core.questionnaire_registry import get_definition, get_versions, list_codes
from app.schemas.screening import QuestionnaireDetailEnvelope

router = APIRouter(prefix="/api/v1/questionnaires", tags=["questionnaires"])


@router.get("", status_code=status.HTTP_200_OK, response_model=EnvelopeResponse,
            dependencies=[Depends(require_permission("screening:read"))])
async def list_questionnaires(request: Request) -> dict:
    items = []
    for code in list_codes():
        defn = get_definition(code)
        items.append({"code": code, "title": defn.title, "version": defn.version, "max_score": defn.max_score})
    return {"data": {"questionnaires": items}, "request_id": getattr(request.state, "request_id", "")}


@router.get("/{code}", status_code=status.HTTP_200_OK, response_model=QuestionnaireDetailEnvelope,
            dependencies=[Depends(require_permission("screening:read"))])
async def get_questionnaire(code: str, request: Request) -> dict:
    defn = get_definition(code)
    if defn is None:
        from app.core.errors import not_found
        raise not_found("Опросник не найден")
    return {"data": defn.to_dict(), "request_id": getattr(request.state, "request_id", "")}


@router.get("/{code}/versions/{version}", status_code=status.HTTP_200_OK, response_model=QuestionnaireDetailEnvelope,
            dependencies=[Depends(require_permission("screening:read"))])
async def get_questionnaire_version(code: str, version: str, request: Request) -> dict:
    defn = get_definition(code, version)
    if defn is None:
        from app.core.errors import not_found
        raise not_found("Версия опросника не найдена")
    return {"data": defn.to_dict(), "request_id": getattr(request.state, "request_id", "")}
