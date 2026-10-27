# CLINICAL ANALYTICS REPORT

## 1. Backend capabilities (verified in code)

### Trend snapshots
- Model: `app/models/trend.py` → `TrendSnapshot` (patient_id, questionnaire_code, period, window_start/end, avg/min/max_score, trend_direction, data JSONB).
- Status: **Defined but never used** — no service, no endpoint, no repository references. Backend capability NOT exposed.

### Diary history
- Endpoint: `GET /api/v1/diary` (list), `GET /api/v1/diary/summary`, `GET /api/v1/diary/today`, `GET /api/v1/diary/{id}`.
- Fields: mood_score, anxiety_score, energy_score, functioning_score, sleep_hours, sleep_quality, notes.
- Used by frontend: NO (mock). Used by mobile: YES (diary check-in + listing wired).

### Screenings history
- Endpoint: `GET /api/v1/screenings` (with patient_id filter), `GET /api/v1/questionnaires`.
- Fields: score, severity, is_critical, critical_reason, questionnaire_type, created_at.
- Used by frontend: partially (Patient Card shows questionnaires from aggregated card).
- Trend: NOT computed/exposed (TrendSnapshot unused).

### Medication adherence
- Endpoints: `POST/GET/PATCH /api/v1/adherence`, `GET/POST /api/v1/prescriptions`.
- Fields: prescription_id, taken_at, is_taken, note, corrected_at, correction_reason.
- Used by frontend: NO (MedicationsPage is GRLS mock). Used by mobile: NO (MedicationScreen local state).
- Backend capability: full CRUD + correction audit, NOT exposed to users.

### Alerts
- Endpoints: `GET/PATCH/PUT /api/v1/alerts`, `GET /api/v1/alerts/{id}/safety-plan`.
- Alert types: critical_symptom, adherence, missed_diary, screening_risk, adverse_event.
- Priorities: mandatory, optional, rx.
- Statuses: new, in_progress, resolved, dismissed.
- Alert rules engine: configurable via JSON/file/env, defaults: PHQ-9 item 9 ≥ 1 (critical), PHQ-9 total ≥ 20, GAD-7 total ≥ 15, critical flag.
- Used by frontend: YES (AlertsPage wired). Safety-plan endpoint: NOT used.

### Messages
- Endpoints: `GET/POST /api/v1/messages`, `PATCH /api/v1/messages/{id}/read`, `GET /api/v1/messages/sla/{practitioner_id}`.
- Used by frontend: YES. Used by mobile: history loaded (send requires practitioner_user_id, now exposed).

### Reports
- Endpoints: `GET /api/v1/reports/pre-visit/{patient_id}`, `GET /api/v1/reports/clinic-analytics`.
- Pre-visit report aggregates: patient, diagnoses, care_plans, appointments, recent_screenings, diary_summary.
- Used by frontend: NO (rich mock UI). Used by mobile: NO.

## 2. Backend capabilities NOT exposed to users (unused)

| Capability | Location | Exposed? | Frontend/Mobile usage |
|---|---|---|---|
| TrendSnapshot model | app/models/trend.py | NO endpoint | None |
| Adherence CRUD | /api/v1/adherence | YES endpoint | None (UI mock) |
| Prescriptions | /api/v1/prescriptions | YES endpoint | None (UI mock) |
| Safety plan | /api/v1/alerts/{id}/safety-plan | YES endpoint | None |
| Clinic analytics | /api/v1/reports/clinic-analytics | YES endpoint | None |
| Trend direction computation | — | NOT implemented | — |

## 3. Phenotype trajectory — current state
- Data exists: screenings (PHQ-9, GAD-7, YMRS, PDSS, ISI), diary (mood, anxiety, energy, functioning, sleep), messages, adherence.
- Computation: NONE. No trend_direction is computed anywhere. TrendSnapshot unused.
- Gap: Need deterministic rule-based trajectory (improvement/deterioration/instability) from existing time-series. Could be computed on-the-fly in report endpoint or materialized.

## 4. Medication adherence — current state
- Data exists: prescriptions + adherence marks (is_taken, taken_at, note, correction).
- Rules: NOT defined. No adherence alert rules in default alert rules (only screening rules).
- Gap: Need adherence alert rules (3 consecutive misses, adherence < 80%, drop after prescription, disengagement).

## 5. Therapy effectiveness monitoring
- Data exists: pre-visit report has before/after screening scores, care_plans, appointments.
- Computation: NONE. No 2/4/8-week comparison logic.
- Gap: Need deterministic comparison of screening scores at baseline vs +2/+4/+8 weeks.

## 6. Explainable alerting — current state
- Alert rules: configurable JSON/file/env, defaults for screening only.
- Missing rules: adherence, missed diary, disengagement, deterioration trajectory.
- Each new rule must include: data source, algorithm, clinical rationale, false-positive risk, explanation.

## 7. Aviandr monitoring workflow
- Medication "Aviandr" appears in frontend mock (medication card, side effects). Backend has Medication entity with contraindications, side_effects, interactions.
- No dedicated monitoring endpoint. Adherence tracking exists but unused.
- Gap: Wire medication adherence to Aviandr prescriptions; surface adherence % in patient card (already in PatientCardApiResponse.medication.adherence field, but data source unknown).

## 8. Recommended next steps (clinical value, minimal code)
1. **Expose trend computation**: Add deterministic trend calculation to pre-visit report (screening score deltas at +2/+4/+8 weeks). No new endpoint — extend existing report.
2. **Adherence alert rules**: Add adherence-based rules to alert rules engine (3 consecutive misses, <80% adherence). Reuse existing alert creation.
3. **Materialize TrendSnapshot**: Populate trend_snapshots from screenings/diary (background or on-demand). Expose via existing report.
4. **Surface adherence in Patient Card**: Wire medication.adherence from real prescription adherence data.
5. **Safety plan**: Wire `/alerts/{id}/safety-plan` to frontend (already endpoint, unused).

## 9. Success metric
Doctor sees real patient trajectory (improvement/deterioration) from existing screening + diary data, with explainable alerts, without new endpoints.