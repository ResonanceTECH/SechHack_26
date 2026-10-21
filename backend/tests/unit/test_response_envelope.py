"""Конверт ответа {data, meta, error} (API_CONTRACTS.md §1)."""

from app.core.response import fail, ok


class TestEnvelope:
    def test_ok_shape(self) -> None:
        body = ok({"x": 1}, request_id="rid-1")
        assert body["data"] == {"x": 1}
        assert body["error"] is None
        assert body["meta"]["request_id"] == "rid-1"
        assert "timestamp" in body["meta"]

    def test_fail_shape(self) -> None:
        body = fail("unauthorized", "Требуется аутентификация", request_id="rid-2")
        assert body["data"] is None
        assert body["error"] == {"code": "unauthorized", "message": "Требуется аутентификация"}

    def test_request_id_generated_when_missing(self) -> None:
        body = ok(None)
        assert len(body["meta"]["request_id"]) == 36  # UUID4
