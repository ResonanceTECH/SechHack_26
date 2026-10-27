# SCREENING DESIGN REVIEW

## Current Design
Current implementation stores only screening results, not questionnaire definitions. Scoring and interpretation are hard-coded for PHQ-9 and GAD-7. Answers are accepted as question_id/value pairs but question text, version, and scales are not persisted.

## Architectural Risks
- Question definitions and texts live only in frontend/mobile or hardcoded client expectations; backend cannot guarantee consistency.
- Versioning is a free-form string with no registry; no validation that answers match a known questionnaire version.
- ScreeningResult lacks questionnaire provenance fields (source, administered_by, language, completion status).
- Scoring is tightly coupled to specific questionnaires; adding PHQ-2/GAD-2/HADS/ISI/PCL-5 requires code changes.
- Critical flag logic is embedded in service; Alert Service cannot easily evaluate rules independently.

## Questionnaire Storage Strategy
Recommend hybrid: backend owns canonical questionnaire definitions (code, version, questions, answer scales, scoring rules, critical thresholds). Frontend/mobile fetch definitions from API and render; they should not hardcode clinical text. Client-side caching/offline is acceptable for mobile, but backend remains source of truth.

## Versioning Strategy
Use immutable questionnaire versions: code + semantic version (e.g. phq9@1.0.0). Each screening result stores questionnaire_code and questionnaire_version. Backend validates submitted version against registry. Scoring rules are version-specific. Do not reuse version strings for content changes.

## API Recommendations
- GET /api/v1/questionnaires and /api/v1/questionnaires/{code}/versions/{version} returning questions, answer scale, scoring metadata.
- POST screening should accept questionnaire_code, questionnaire_version, answers, optional started_at/completed_at, device/source metadata.
- ScreeningResult should include interpretation, severity, critical_reason, and scoring version.
- Add idempotency key for offline mobile sync.

## Frontend Impact
Frontend can initially hardcode PHQ-9/GAD-7 but should migrate to backend-driven definitions to avoid mismatches. Needs handling for unknown questionnaire versions and deprecated versions.

## Mobile Impact
Mobile needs offline capability; should cache questionnaire definitions and submit with idempotency keys. Must tolerate backend version updates and partial sync.

## Alert Service Impact
Alert Service needs structured signals: is_critical, critical_reason, score, severity, questionnaire_code/version, patient_id, created_at. Current fields are sufficient for basic alerts but critical_reason and severity should be persisted.

## Recommended Changes Before Phase 9.2
1. Introduce questionnaire registry in backend (code, not DB initially) with full definitions and scoring rules.
2. Add GET endpoints for questionnaires/versions/questions.
3. Extend ScreeningResult with questionnaire_code, severity, critical_reason, administered_by, source, started_at, completed_at, idempotency_key.
4. Make scoring pluggable by questionnaire code/version.
5. Add migration for new fields before data accumulates.

## Final Verdict
Current implementation is acceptable for PHQ-9/GAD-7 MVP but should be refactored to a backend-driven questionnaire registry and richer ScreeningResult before Alert/Diary phases. These changes are cheap now and expensive later.
