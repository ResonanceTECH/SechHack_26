# F.MD - Independent System Audit (Clinical Compass Backend)

## 1. Executive Summary

- Backend runtime обновлён и проверен: cc-backend, cc-postgres, cc-redis healthy.
- Миграции: head 0011_diary_entries (11 миграций).
- OpenAPI runtime: 41 путь; committed docs/openapi.json: 37 путей (расхождение diary).
- Тесты: 20 тестовых файлов, pytest -q -> 87 passed.
- Frontend/Mobile: UI only, без реальных вызовов backend (кроме health).
- Figma: дизайн-система и экраны подтверждены, полный маппинг Screen->DTO->Endpoint не построен.

## 2. Evidence

- Runtime: GET /health -> {ok:true}; GET /api/v1/health -> {data:{status:healthy}}.
- Migrations: alembic current -> 0011_diary_entries (head).
- Router: app/api/v1/router.py регистрирует 12 роутеров.
- Tests: tests/ (20 файлов), 87 passed.
- OpenAPI diff: committed 37 vs runtime 41; only runtime имеет /api/v1/diary*.`n
## 3. Findings

### P0
- Нет.

### P1
- OpenAPI committed drift (diary endpoints). Evidence: docs/openapi.json (37) vs runtime (41).
- Отсутствует tests/api/test_diary_api.py (нет покрытия diary API). Evidence: tests/api/ список.
- Frontend/Mobile не интегрированы с backend (UI only/mock). Evidence: wt_mobile/mobile/src/api/client.ts (только health), отсутствие fetch в wt_frontend/frontend/src.

### P2
- Swallowed exceptions в alert/screening services. Evidence: app/services/alert_service.py:45,142,171,211, app/services/screening_service.py:90.
- Broad except Exception в auth refresh. Evidence: app/services/auth_service.py:174.

## 4. Test Coverage

- Реализовано: diary, alerts, diagnoses, assessment plans, safety, screenings, auth, patients, questionnaires.
- Тесты существуют для большинства, но diary API покрытия нет.
- Фактически протестировано: 87 passed.

## 5. Frontend/Mobile

- Mobile screens: 68; Frontend pages: 60.
- API-вызовы не найдены (кроме health) -> Status = UI ONLY / MOCK ONLY.

## 6. Figma

- Файл sge8zDLWQRdqkJQ8BwwY3O доступен через MCP; дизайн-система подтверждена.
- Полный маппинг Screen->DTO->Endpoint не построен -> Status = UNVERIFIED.

## 7. Confidence Scores

- Architecture: 7/10
- Security: 6/10
- Database: 8/10
- API: 8/10
- Tests: 7/10
- Frontend: 2/10
- Mobile: 2/10
- Figma: 3/10

## 8. Final Verdict

- P0: none.
- P1: present.
- Final Verdict = PARTIALLY READY.

## 9. Recommended Next Steps

1. Перегенерировать committed openapi.json из runtime.
2. Добавить diary API tests.
3. Заменить swallowed exceptions на логирование.
4. Построить frontend/mobile API integration.
5. Построить Figma->backend mapping.

## 10. Backlog (Not Implemented / Gaps)

- Exercises/medications/appointments/messages/analytics endpoints: frontend pages exist, backend APIs absent.
- Figma full Screen->DTO->Endpoint mapping not built.
- Frontend/Mobile API integration (currently UI-only/mock).
- Scales beyond PHQ-9/GAD-7 (e.g. hypomania 8) not implemented.
- Diary update ownership check missing.
- Swallowed exceptions in alert/screening services (P2).
- Broad except in auth refresh (P2).
- Figma visual image review impossible via MCP (structure/text only).
- Chat export reviewed: no new actionable backend requirements beyond backlog; contains many discarded ideas.
