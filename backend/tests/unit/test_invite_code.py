"""Invite-код: алфавит, нормализация дефиса, генерация (AUTH_PLAN.md §3.2)."""

import re

from app.schemas.auth import InviteVerifyRequest
from app.services.invite_service import ALPHABET, generate_code_body


class TestAlphabet:
    def test_excludes_ambiguous_symbols(self) -> None:
        for forbidden in "01IO":
            assert forbidden not in ALPHABET, forbidden

    def test_alphabet_length(self) -> None:
        # 32 символа (8 цифр 2-9 + 24 буквы A-Z без I/O)
        assert len(ALPHABET) == len(set(ALPHABET)) == 32


class TestCodeGeneration:
    def test_body_uses_only_alphabet(self) -> None:
        for _ in range(50):
            body = generate_code_body()
            assert len(body) == 5
            assert all(ch in ALPHABET for ch in body), body


class TestNormalization:
    def test_dash_is_stripped_for_backend(self) -> None:
        """UI-маска «RAV-27400» → на бэкенд приходит «RAV27400»."""
        parsed = InviteVerifyRequest.model_validate({"code": "RAV-27400"})
        assert parsed.code == "RAV27400"

    def test_lowercase_and_spaces_normalized(self) -> None:
        parsed = InviteVerifyRequest.model_validate({"code": " rav-27400 "})
        assert parsed.code == "RAV27400"

    def test_mobile_regex_extract_compatible(self) -> None:
        """Регулярка мобилки (extractInviteCode) должна извлекать код из QR."""
        qr_payload = "https://example.com/join/RAV-27400"
        match = re.search(r"[A-Z]{2,}-\d{3,}", qr_payload, re.IGNORECASE)
        assert match is not None
        assert match.group(0).upper() == "RAV-27400"
