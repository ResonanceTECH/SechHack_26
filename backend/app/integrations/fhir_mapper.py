"""Mapping helpers from Clinical Compass entities to FHIR R4 resources."""
from __future__ import annotations

from typing import Any


def screening_result_to_fhir_observation(*, patient_ref: str, questionnaire_code: str, total_score: int, severity: str, recorded_at: str) -> dict[str, Any]:
    """Build a minimal FHIR Observation for a screening result."""
    return {
        "resourceType": "Observation",
        "status": "final",
        "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "survey"}]}],
        "code": {"text": questionnaire_code},
        "subject": {"reference": patient_ref},
        "effectiveDateTime": recorded_at,
        "valueInteger": total_score,
        "interpretation": [{"text": severity}],
    }