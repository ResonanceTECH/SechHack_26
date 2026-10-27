# Clinical Compass

## Mission

Довести платформу до состояния полностью интегрированного, безопасного и клинически применимого продукта.

Основные цели:

- mobile_dev ↔ backend
- frontend_dev ↔ backend
- удаление mock данных
- устранение интеграционных разрывов
- подключение неиспользуемых backend возможностей
- аудит безопасности
- аудит клинической логики
- улучшение аналитики и алертинга
- подготовка отчётности

---

## Source Priority

Использовать источники в следующем порядке:

1. Реальный код mobile_dev
2. Реальный код frontend_dev
3. Реальный пользовательский сценарий
4. Реальный backend код
5. BACKEND_SPEC.md
6. CLIENT_MAPPING.md
7. Макеты экранов
8. White Paper

Правило:

Code > Documentation

White Paper использовать только как продуктовый и клинический контекст.

Не использовать White Paper как источник API-контрактов или архитектурных решений.

---

## Operator Authority

Оператор проекта является высшим источником истины.

В проекте существуют:

- устные договорённости команды;
- согласованные решения психиатров;
- продуктовые исключения;
- неформализованные правила.

Они могут отсутствовать в документации.

Если обнаружено:

- неоднозначное поведение;
- конфликт требований;
- несколько допустимых решений;
- риск влияния на пациента;
- риск изменения клинической логики;
- риск изменения маршрутизации;
- риск изменения алертинга;

агент обязан остановиться и создать запись:

OPERATOR DECISION REQUIRED

до внесения изменений.

Решение оператора имеет приоритет над:

- документацией;
- предыдущими решениями агента;
- внутренними предположениями.

---

## Decision Rules

Приоритет принятия решений:

User Flow
↓
Client UX
↓
Client Code
↓
Backend Adaptation
↓
Documentation

Главная цель:

сохранить рабочий пользовательский сценарий.

---

## Change Budget

Всегда выбирать минимально достаточное решение.

Предпочитать:

локальное исправление

вместо

массового рефакторинга.

Оценивать:

1. риск для пациента
2. риск для пользователей
3. риск для продакшена
4. стоимость поддержки
5. объём изменений

---

## Backend Adaptation Policy

Предпочтительное решение:

изменить backend

а не клиента.

Разрешается:

- новые endpoint;
- новые DTO;
- агрегирующие endpoint;
- compatibility layer;
- mapper layer;
- BFF layer;
- дополнительные read-model endpoint.

Запрещены breaking changes без необходимости.

---

## Client Modification Policy

Клиент разрешено изменять только если:

- обнаружен дефект;
- нарушены требования безопасности;
- нарушен RBAC;
- нарушена клиническая логика;
- возникает критический технический долг.

---

## Backend Discovery

Обязательно искать:

### Client Needs API

Экран существует.

API отсутствует.

---

### API Exists But Not Connected

API существует.

Экран использует mock.

---

### Backend Capability Not Used

Функция реализована в backend.

Mobile и web её не используют.

Подготовить отдельный отчёт.

---

## Clinical Safety

Платформа является CDSS.

Платформа не заменяет врача.

Платформа не принимает решения за врача.

---

### Запрещено

- ставить диагноз;
- изменять диагноз;
- назначать терапию;
- изменять терапию;
- отменять терапию;
- назначать дозировки;
- автоматически направлять пациента;
- автоматически менять план лечения.

---

### Разрешено

- анализ рисков;
- анализ траекторий;
- анализ приверженности;
- алертинг;
- поиск паттернов;
- подготовка инсайтов;
- подготовка пояснений врачу.

---

### Клинический конвейер

Только:

Data
→ Pattern
→ Risk
→ Alert
→ Doctor Review
→ Decision

Запрещено:

Data
→ AI
→ Treatment Decision

---

## RF Compliance

Все клинические правила должны опираться на:

- действующие клинические рекомендации РФ;
- рекомендации Минздрава РФ;
- валидированные русскоязычные шкалы;
- инструкции зарегистрированных лекарственных препаратов;
- требования кейса;
- подтверждённые решения команды.

Международные рекомендации использовать только как дополнение.

---

## Privacy & Security

Обязательно соблюдать:

- 152-ФЗ;
- врачебную тайну;
- принцип минимально необходимого доступа;
- consent-based access;
- аудит действий пользователей.

---

## Analytics Policy

Разрешается развивать:

- цифровой фенотип;
- анализ траекторий;
- риск-модели;
- алертинг;
- adherence analytics;
- engagement analytics.

Использовать данные:

- PHQ-9;
- GAD-7;
- YMRS;
- дневники;
- симптомы;
- сон;
- сообщения;
- приверженность;
- кризисные сигналы;
- планы безопасности.

---

## Alert Policy

Каждый новый алерт обязан содержать:

- источник данных;
- правило срабатывания;
- объяснение;
- клиническое обоснование;
- предполагаемое действие врача.

Обязательно поддерживать Explainability.

---

## AI & ML Policy

Production:

- rules;
- thresholds;
- scoring;
- deterministic analytics;
- trajectory analysis.

Research:

- anomaly detection;
- phenotype clustering;
- deterioration prediction;
- relapse prediction;
- engagement prediction.

Запрещено для production без отдельного решения:

- автономная диагностика;
- автономное лечение;
- black-box рекомендации;
- LLM назначения;
- автоматическая маршрутизация.

---

## Security Testing

Обязательно проверять:

- RBAC;
- ownership isolation;
- clinic isolation;
- IDOR;
- JWT;
- refresh rotation;
- token reuse;
- audit integrity;
- PHI leakage;
- rate limits.

Проводить:

- SQL Injection;
- XSS;
- CSRF;
- SSRF;
- Broken Access Control;
- Mass Assignment;
- Enumeration.

---

## Testing

Обязательно:

- Unit tests;
- Integration tests;
- API tests;
- E2E tests;
- Security tests.

Проверять:

### Patient Journey

Registration
→ Consent
→ Invite
→ Screening
→ Diary
→ Medication
→ Messages
→ Alerts

### Doctor Journey

Login
→ Dashboard
→ Patients
→ Patient Card
→ Diagnosis
→ Assessment
→ Care Plan
→ Alerts

### Admin Journey

Login
→ Staff
→ Roles
→ Audit
→ Settings

---

## Reports

Формировать:

### Integration Report

Что подключено.

### API Coverage Report

Что используется.

### Gap Report

Что отсутствует.

### Backend Capability Report

Что реализовано, но не используется.

### Clinical Analytics Report

Траектории и алерты.

### Security Report

Найденные риски.

### Readiness Report

Backend readiness
Frontend readiness
Mobile readiness
Security readiness
Clinical readiness
Production readiness

---

## Acceptance Criteria

Перед завершением задачи:

- все поддерживаемые экраны подключены;
- критические mock устранены;
- нет Critical рисков;
- нет High рисков;
- backend build PASS;
- frontend build PASS;
- mobile build PASS;
- typecheck PASS;
- lint PASS;
- E2E PASS;
- security PASS;
- отчёты сформированы.

---

## Non Goals

Не является целью:

- переписывание продукта;
- переписывание UX;
- создание новой архитектуры;
- замена клинической модели;
- замена врача искусственным интеллектом.

Предпочитать эволюцию существующей системы.

---

## Additional Context Sources

The following documents provide additional project context
and may influence prioritization decisions:

- CLIENT_INTEGRATION.md
- White_Paper.MD
- case_info.pdf
- GENERAL_PRINCIPLES_OF_PSYCHOPHARMACOTHERAPY_IN_GENERAL_MEDICINE__Petelin_Dmitry_Sergeevich.pdf
- Startups_in_psychiatry__from_case_to_company.pdf

These documents provide:

- product context;
- clinical context;
- competition benchmarks;
- implementation roadmap;
- integration priorities.

They do not override:

- source code;
- runtime behavior;
- OpenAPI;
- BACKEND_SPEC.md;
- CLIENT_MAPPING.md.
