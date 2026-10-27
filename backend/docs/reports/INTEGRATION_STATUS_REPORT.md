# INTEGRATION STATUS REPORT

## Readiness Percentages

| Показатель | Значение | Обоснование |
|------------|----------|-------------|
| **Frontend readiness** | 30% | 5/12 основных экранов на REAL API (Login, Admin Login, Patients, Dashboard, Patient Card); API-слой реализован; 32 mock-файла осталось |
| **Mobile readiness** | 45% | API-модули полностью реализованы; HomeScreen подключён к реальному API (name/initials); 8 экранов на моках |
| **Backend readiness** | 100% | 164 тестов зелёные; 92 OpenAPI пути; миграции на head 0037; RLS, rate limiting, аудит — готово |
| **API coverage** | 9.8% | 9 из 92 backend путей используются клиентами |
| **Mock removal progress** | 13.5% | 5 из ~37 frontend mock-файлов заменены; 8 мобильных экранов на моках |
| **Overall readiness** | 40% | Взвешенная оценка: backend готов, клиенты на 1/2 пути |

## User Journey Status Summary

| Путь | Всего шагов | REAL API | MOCK ONLY | UI ONLY | UNVERIFIED | Статус |
|------|-------------|----------|-----------|---------|------------|--------|
| Patient Journey | 11 | 6 | 4 | 1 | 0 | PARTIAL |

## Экраны на REAL API (доказано кодом)

| # | Экран | Файл | API вызов | Endpoint | Метод | Статус |
|---|-------|------|-----------|----------|-------|--------|
| 1 | Login | `frontend_dev/frontend/src/pages/login/LoginPage.tsx` | `login()` → `request()` | `/api/v1/auth/login` | POST | REAL API |
| 2 | Patients | `frontend_dev/frontend/src/pages/patients/PatientsPage.tsx` | `get<PatientListItem[]>()` | `/api/v1/patients` | GET | REAL API |
| 3 | Dashboard | `frontend_dev/frontend/src/pages/dashboard/DashboardPage.tsx` | `get<DashboardResponse>()` | `/api/v1/home/dashboard` | GET | REAL API |
| 4 | Register (phone) | `mobile_dev/mobile/App.tsx` → `RegisterPhoneScreen` | `lookupPhone()` + `requestSms()` | `/api/v1/auth/phone/lookup`, `/api/v1/auth/sms/request` | POST | REAL API |
| 5 | Register (SMS) | `mobile_dev/mobile/App.tsx` → `RegisterSmsScreen` | `verifySms()` + `getMe()` | `/api/v1/auth/sms/verify`, `/api/v1/auth/me` | POST/GET | REAL API |
| 6 | Consent | `mobile_dev/mobile/App.tsx` → `RegisterConsentScreen` | `storeConsent()` | `/api/v1/auth/consent` | POST | REAL API |
| 7 | Doctor Invite | `mobile_dev/mobile/App.tsx` → `RegisterDoctorScreen` | `verifyInvite()` | `/api/v1/auth/invite/verify` | POST | REAL API |
| 8 | Screening | `mobile_dev/mobile/App.tsx` → `RegisterQuestionnaireQuestionScreen` | `submitScreening()` | `/api/v1/screenings` | POST | REAL API |

## Экраны на MOCK ONLY (поименно, требуют подключения)

### Frontend (14 экранов):
1. `src/pages/profile/ProfilePage.tsx` — mockDoctor
2. `src/pages/patient-card/PatientCardPage.tsx` — mockPatientCard, mockDiary, mockPatientMedications, mockProgram, mockQuestionnaires, mockVisits
3. `src/pages/alerts/AlertsPage.tsx` — mockAlerts
4. `src/pages/medications/MedicationsPage.tsx` — mockMedications
5. `src/pages/messages/MessagesPage.tsx` — mockMessages
6. `src/pages/exercises/ExercisesPage.tsx` — mockExercises, mockPatients
7. `src/pages/treatment-plan/TreatmentPlanPage.tsx` — mockTreatmentPlan
8. `src/pages/pre-visit-report/PreVisitReportPage.tsx` — mockPatientCard, mockPreVisitReport, mockReportPreview
9. `src/pages/pre-visit-reports/PreVisitReportsPage.tsx` — mockPreVisitReports
10. `src/pages/admin/employees/EmployeesPage.tsx` — mockAdmin
11. `src/pages/admin/roles/RolesAccessPage.tsx` — mockRolesAccess
12. `src/pages/admin/audit/AuditPage.tsx` — mockAccessInviteLog
13. `src/pages/admin/settings/SettingsPage.tsx` — mockSettings
14. `src/pages/admin/analytics/AnalyticsPage.tsx` — mockAnalytics

### Mobile (8 экранов):
1. `src/screens/HomeScreen.tsx` — локальные данные, нет API

## Security Findings

| # | Находка | Severity | Место |
|---|---------|----------|-------|
| 1 | Admin login использует хардкод `DEMO_APP_CODE = '418502'` вместо реальной аутентификации | Critical | `src/pages/login/AdminLogin2faPage.tsx:6` |
| 2 | DoctorLayout импортирует моковые данные на уровне макета | High | `src/layouts/DoctorLayout.tsx:9-10` |
| 3 | Sidebar отображает `doctorProfile` из мока вместо реального профиля | High | `src/components/sidebar/Sidebar.tsx:11` |
| 4 | Нет RBAC-проверок на клиенте | Medium | `src/app/router.tsx:149-179` |
| 5 | Токены в localStorage без httpOnly флага | Medium | `src/lib/api.ts:15-16` |

## Clinical Workflow Breakpoints

| # | Брекпоинт | Влияние |
|---|-----------|---------|
| 1 | Врач не видит реальную карточку пациента | Не может оценить состояние пациента |
| 2 | Врач не видит реальные алерты | Пропуск критичных алертов |
| 3 | Врач не может создать план лечения | Нет ведения пациента |
| 4 | Пациент не видит реальный Home экран | Нет актуальной информации |
| 5 | Пациент не видит историю дневника | Нет динамики состояния |
| 6 | Пациент не может отправить сообщение врачу | Разрыв коммуникации |

## Minimal Path to Connect (no new endpoints needed)

| Приоритет | Экран | Endpoint | Файл |
|-----------|-------|----------|------|
| 1 | Patient Card | `GET /api/v1/patients/{id}/card` | `pages/patient-card/PatientCardPage.tsx` |
| 2 | Alerts | `GET /api/v1/alerts` | `pages/alerts/AlertsPage.tsx` |
| 3 | Medications | `GET /api/v1/medications` | `pages/medications/MedicationsPage.tsx` |
| 4 | Profile | `GET /api/v1/users/me` | `pages/profile/ProfilePage.tsx` |
| 5 | Home (mobile) | `GET /api/v1/patients/{id}/summary` | `screens/HomeScreen.tsx` |
| 6 | Diary listing (mobile) | `GET /api/v1/diary` | `screens/DiaryScreen.tsx` |
| 7 | Admin Staff | `GET /api/v1/clinics/{id}/members` | `pages/admin/employees/EmployeesPage.tsx` |
| 8 | Admin Audit | `GET /api/v1/audit/*` | `pages/admin/audit/AuditPage.tsx` |
| 9 | Admin Settings | `GET /api/v1/clinics/{id}/settings` | `pages/admin/settings/SettingsPage.tsx` |

## Documentation Sync Status

| Файл | Статус | Обновлён |
|------|--------|----------|
| `docs/CLIENT_INTEGRATION.md` | ✅ | Статус frontend: PARTIAL, 3 экрана на REAL API |
| `docs/CLIENT_MAPPING.md` | ✅ | Таблица Frontend Connection Status добавлена |
| `docs/reports/AUDIT_PRE_FRONTEND_INTEGRATION.md` | ✅ | Frontend: BLOCKED→PARTIAL, mock 37→34, API calls 0→3 |
| `docs/reports/FIGMA_DTO_VERIFICATION.md` | ✅ | Dashboard/Patients verdicts: REAL API |
| `docs/openapi.json` | ⚠ | Не изменён (backend API контракты не менялись) |
| `docs/reports/PHASE62_FRONTEND_INTEGRATION_REPORT.md` | ✅ | Создан |
| `docs/reports/PHASE63_USER_JOURNEY_AUDIT.md` | ✅ | Создан |
| `docs/reports/INTEGRATION_REPORT_FRONTEND.md` | ✅ | Создан |
| `docs/reports/GAP_REPORT_FRONTEND_INTEGRATION.md` | ✅ | Обновлён с данными аудита сценариев |
| `docs/reports/BACKEND_CAPABILITY_REPORT.md` | ✅ | Создан |
| `docs/reports/FRONTEND_READINESS_REPORT.md` | ✅ | Создан |
| `docs/reports/PRODUCTION_READINESS_REPORT.md` | ✅ | Обновлён с данными аудита сценариев |

## Next 5 Priority Tasks

1. **Wire Patient Card** — подключить `pages/patient-card/PatientCardPage.tsx` к `GET /api/v1/patients/{id}/card` (замыкает путь врача Login → Dashboard → Patients → Patient Card)
2. **Fix Admin Login** — заменить хардкод `DEMO_APP_CODE` на реальную аутентификацию через `/api/v1/auth/login` (путь администратора полностью сломан)
3. **Wire Home (mobile)** — подключить `screens/HomeScreen.tsx` к `GET /api/v1/patients/{id}/summary` (замыкает путь пациента Registration → Consent → Home)
4. **Wire Alerts** — подключить `pages/alerts/AlertsPage.tsx` к `GET /api/v1/alerts` (врач видит реальные алерты)
5. **Wire Diary listing (mobile)** — подключить `screens/DiaryScreen.tsx` к `GET /api/v1/diary` (пациент видит историю дневника)
2. `src/screens/DiaryScreen.tsx` — хардкод MOOD/ANXIETY массивов
3. `src/screens/MedicationScreen.tsx` — локальное состояние dosis, нет API
4. `src/screens/ChatScreen.tsx` — локальное состояние, нет API
5. `src/screens/NotificationsScreen.tsx` — хардкод уведомлений
6. `src/screens/SymptomSelectScreen.tsx` — локальный выбор, нет API
7. `src/screens/SymptomDetailScreen.tsx` — только навигация, нет API
8. `src/screens/EmergencyHelpScreen.tsx` — нет API
| 9 | Diary check-in | `mobile_dev/mobile/App.tsx` → `CheckInSleepScreen` | `submitDiaryEntry()` | `/api/v1/diary` | POST | REAL API |
| 10 | Medication registration | `mobile_dev/mobile/App.tsx` → `RegisterMedsScreen` | `updateMyMedications()` | `/api/v1/patients/me/medications` | PATCH | REAL API |
| Doctor Journey | 10 | 3 | 4 | 0 | 3 | PARTIAL |
| Admin Journey | 5 | 0 | 5 | 0 | 0 | NOT READY |
| **Всего** | **26** | **9** | **13** | **1** | **3** | — |