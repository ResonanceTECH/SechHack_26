# PHASE 11.0 — CLINICAL ARCHITECTURE UPDATE

Дата: 2026-10-23
Тип: архитектурная синхронизация (только документация)

# Executive Summary

Документация синхронизирована с клиническим направлением продукта. Выявлены пробелы: отсутствие слоя диагноза (PatientDiagnosis), Assessment Plan (MBC), обновление шкалы дневника, расширение SafetyPlan через шаблоны. Никакой код/миграции/схемы не изменялись.

# Diagnosis Layer

Текущий Icd10Code — плоская запись. Не поддерживает историю, закрытие, ремиссию, множественные диагнозы со статусами, primary constraint, ICD-11. Предложено: PatientDiagnosis + DiagnosisReference.

# ICD10 / ICD11 Strategy

Future-proof: coding_system (ICD10/ICD11) + code + title. API exposes coding_system. Backward compat через deprecated alias.

# MBC Layer

Цепочка Diagnosis → Assessment Plan → Screening → Trend. Отсутствует AssessmentPlan и SymptomTrend. Screening-ядро уже поддерживает PHQ-9/GAD-7/PDSS/HCL-33/C-SSRS через registry.

# Diary Rework

Новые шкалы: mood -3..+3, anxiety 0..4, energy 0..4, functioning 0..4. Добавить functioning_score. Микро-дневник (partial entries). Миграция CHECK + ADD COLUMN.

# Safety Plan Architecture

SafetyPlan остаётся patient-specific. Reusable clinical content → SafetyPlanTemplate / ClinicalContentLibrary, ссылка через template_id (nullable) + override. Структурированные контакты (JSONB) и crisis steps.

# Screening Expansion

PHQ-9/GAD-7 уже поддерживаются. PDSS/HCL-33/C-SSRS требуют registry entries + scoring/critical rules; ядро архитектуры не меняется. C-SSRS — клинический safety-инструмент, рассмотреть отдельную сущность.

# Patient Card Requirements

Недостающие блоки: диагнозы (активные + история + primary), расписание оценок, приверженность, планы безопасности, кризисная история, тренды скринингов.

# Documents Updated

- ARCHITECTURE.md
- DOMAIN_MODEL.md
- DB_SCHEMA.md
- API_CONTRACTS.md
- MODULES.md
- TASKS.md

# Recommended Next Implementation Phase

Phase 10.2: Diagnosis Layer (PatientDiagnosis + DiagnosisReference + API + Patient Card).
