# PHASE 11.1 — IMPLEMENTATION BACKLOG

Валидация выводов PHASE11_0_CLINICAL_DOMAIN_REVIEW.md против кода, миграций, OpenAPI и документации.

Дата: 2026-10-23

---

## Validation Table

| Feature | Documentation Status | Code Status | Migration Status | API Status | Ready For Development |
|---|---|---|---|---|---|
| Icd10Code (плоская запись) | DOCUMENTED_ONLY (DOMAIN_MODEL/DB_SCHEMA) | NOT_IMPLEMENTED (нет модели/сервиса) | NOT_IMPLEMENTED (нет таблицы в миграциях) | PLANNED (CURRENT_API: ПЛАНИРУЕТСЯ) | B (требует миграции) |
| PatientDiagnosis (coding_system, status, ended_at) | DOCUMENTED_ONLY (клинический обзор) | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | A (можно делать сейчас) |
| DiagnosisReference (справочник ICD-10/ICD-11) | DOCUMENTED_ONLY | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | A |
| Primary diagnosis constraint | DOCUMENTED_ONLY | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | A |
| Diagnosis history / closure / remission | DOCUMENTED_ONLY | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | A |
| Patient Card diagnosis view | DOCUMENTED_ONLY | NOT_IMPLEMENTED | N/A | NOT_IMPLEMENTED | A |
| AssessmentPlan (MBC) | DOCUMENTED_ONLY | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | D (архитектурное решение) |
| SymptomTrend | DOCUMENTED_ONLY | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | D |
| ScreeningResult (PHQ-9/GAD-7) | IMPLEMENTED (DOMAIN_MODEL/DB_SCHEMA) | IMPLEMENTED (clinical.py) | IMPLEMENTED (0002/0003) | IMPLEMENTED (CURRENT_API) | N/A (готово) |
| Questionnaire Registry | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | N/A (готово) |
| DiaryEntry (1..5) | IMPLEMENTED (DOMAIN_MODEL/DB_SCHEMA) | IMPLEMENTED (clinical.py) | IMPLEMENTED (0001 base) | NOT_IMPLEMENTED (нет API) | B (требует миграции для новой шкалы) |
| DiaryEntry new scale (-3..+3, 0..4, functioning) | DOCUMENTED_ONLY | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | B |
| SafetyPlan (базовый) | IMPLEMENTED (DOMAIN_MODEL/DB_SCHEMA) | NOT_IMPLEMENTED (нет модели в коде) | NOT_IMPLEMENTED | PLANNED | C (требует модели) |
| SafetyPlanTemplate / ClinicalContentLibrary | DOCUMENTED_ONLY | NOT_IMPLEMENTED | NOT_IMPLEMENTED | NOT_IMPLEMENTED | D |
| CrisisSignal | DOCUMENTED_ONLY (DOMAIN_MODEL/DB_SCHEMA) | NOT_IMPLEMENTED | NOT_IMPLEMENTED | PLANNED | C |
| CssrsAssessment | DOCUMENTED_ONLY (DOMAIN_MODEL/DB_SCHEMA) | NOT_IMPLEMENTED | NOT_IMPLEMENTED | PLANNED | C |
| MedicationSkipReason | DOCUMENTED_ONLY (DOMAIN_MODEL/DB_SCHEMA) | NOT_IMPLEMENTED | NOT_IMPLEMENTED | PLANNED | C |
| Adverse Event alert type | IMPLEMENTED (alert type enum) | IMPLEMENTED (care.py Alert) | IMPLEMENTED (0004) | IMPLEMENTED | N/A (готово) |

---

## Backlog (упорядоченный)

### A — можно делать сейчас
1. PatientDiagnosis entity (эволюция Icd10Code): model + migration + API + Patient Card view.
2. DiagnosisReference справочник: model + migration + seed ICD-10.
3. Primary diagnosis partial unique index.
4. Diagnosis history/closure/remission API.

### B — требует миграции
5. DiaryEntry новая шкала: ALTER CHECK constraints + ADD functioning_score + data mapping.
6. Icd10Code → patient_diagnoses rename/migration.

### C — требует модели
7. SafetyPlan SQLAlchemy model + migration + API.
8. CrisisSignal model + migration + API.
9. CssrsAssessment model + migration + API.
10. MedicationSkipReason model + migration + API.

### D — требует архитектурного решения
11. AssessmentPlan / MBC layer (граница со Screening).
12. SymptomTrend (агрегат).
13. SafetyPlanTemplate vs ClinicalContentLibrary (выбрать термин).
14. C-SSRS в MVP (учесть экраны).
15. Полный ICD-11 справочник (seed-процесс).
16. Микро-дневник (partial entries, nullable поля).
