# INTEGRATION REPORT — Frontend Integration Status

## Executive Summary

После подключения 3 экранов фронтенда к реальному API (Login, Patients, Dashboard) остаётся ~34 mock-экрана. Mobile API-клиент полностью реализован, но экраны мобилки используют локальные данные, за исключением потока регистрации/авторизации.

## Backend Readiness

| Компонент | Статус | Детали |
|-----------|--------|--------|
| API endpoints | READY | 92 OpenAPI пути, все документированы |
| Authentication | READY | JWT access/refresh, rotation, /api/v1/auth/* |
| RBAC | READY | Роли doctor/psychologist/coordinator/admin/superadmin/patient |
| Migrations | READY | 37 миграций, head 0037_patient_self_reported_meds |
| Tests | READY | 164 pytest passed |
| OpenAPI | READY | 92 путей, совпадает с runtime |

## Frontend Integration Status

### Подключено к REAL API (3 экрана)

| Экран | Файл | Endpoint | Метод |
|-------|------|----------|-------|
| Login | src/pages/login/LoginPage.tsx | /api/v1/auth/login | POST |
| Patients | src/pages/patients/PatientsPage.tsx | /api/v1/patients | GET |
| Dashboard | src/pages/dashboard/DashboardPage.tsx | /api/v1/home/dashboard | GET |

### На MOCK ONLY (~34 экрана)

См. раздел 7 отчёта PHASE63_USER_JOURNEY_AUDIT.md — полный список мок-экранов фронтенда и мобильного приложения.

### Mobile Integration Status

API-клиент реализован (client.ts, auth.ts, screenings.ts, diary.ts, patientMeds.ts, storage.ts). Подключено через App.tsx:
- Регистрация/авторизация: lookupPhone, requestSms, verifySms, verifyInvite, storeConsent, getMe, loginEmail — REAL API
- Скрининги: submitScreening — REAL API
- Дневник (check-in): submitDiaryEntry — REAL API
- Лекарства (регистрация): updateMyMedications — REAL API

Экраны на моковых данных: HomeScreen, DiaryScreen, MedicationScreen, ChatScreen, NotificationsScreen, SymptomSelectScreen, SymptomDetailScreen, EmergencyHelpScreen.

## Integration Metrics

| Метрика | До | После | Изменение |
|---------|----|-------|-----------|
| Фронтенд экранов на REAL API | 0 | 3 | +3 |
| Mock файлов фронтенда | 37 | ~34 | -3 |
| Пользовательских сценариев полностью работающих | 0 | 0 | 0 (экраны подключены, но сценарии не склеены end-to-end) |
| Security рисков (Critical/High) | 0 | 2 | +2 (выявлены при аудите) |

## Blocker Analysis

**Основной блокер:** Врач не может пройти полный путь Login → Dashboard → Patients → Patient Card, потому что Patient Card использует мок. Без реальной карточки пациента сценарий врача не замкнут.

**Вторичный блокер:** Пациент не может пройти путь Home → Diary → Messages, потому что Home экран и список дневника используют моковые данные.

## Next Steps (Priority Order)

1. Подключить Patient Card к `GET /api/v1/patients/{id}/card` — замкнуть путь врача
2. Подключить Alerts к `GET /api/v1/alerts` — врач видит реальные алерты
3. Подключить Home (mobile) к `GET /api/v1/patients/{id}/summary` — пациент видит реальные данные
4. Исправить Admin Login — заменить DEMO_APP_CODE на реальную аутентификацию
5. Подключить Diary listing (mobile) к `GET /api/v1/diary` — пациент видит историю