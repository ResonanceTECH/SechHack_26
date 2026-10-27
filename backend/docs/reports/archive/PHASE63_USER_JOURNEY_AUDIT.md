# PHASE63 REPORT — User Journey Audit (Patient, Doctor, Admin)

## Executive Summary

Аудит всех трёх пользовательских сценариев (Patient Journey, Doctor Journey, Admin Journey) выполнен по фактическому коду фронтенда и мобильного приложения. Backend не менялся — все необходимые endpoints уже существуют.

Ключевой вывод: API-клиентские слои реализованы и готовы (фронтенд: api.ts + auth.ts; мобильный: client.ts + auth.ts + screenings.ts + diary.ts + patientMeds.ts), но большинство экранов всё ещё используют моковые данные. Подключены только 3 экрана фронтенда (Login, Patients, Dashboard) и частично мобильный поток регистрации/авторизации.

## 1. PATIENT JOURNEY (Mobile App)

| Шаг | Экран | Файл | API вызов | Endpoint | Статус |
|-----|-------|------|-----------|----------|--------|
| 1. Registration (phone) | RegisterPhoneScreen | screens/RegisterPhoneScreen.tsx | lookupPhone() + requestSms() (via App.tsx) | POST /api/v1/auth/phone/lookup, POST /api/v1/auth/sms/request | REAL API |
| 2. Registration (SMS) | RegisterSmsScreen | screens/RegisterSmsScreen.tsx | verifySms() + getMe() (via App.tsx) | POST /api/v1/auth/sms/verify, GET /api/v1/auth/me | REAL API |
| 3. Consent | RegisterConsentScreen | screens/RegisterConsentScreen.tsx | storeConsent() (via App.tsx) | POST /api/v1/auth/consent | REAL API |
| 4. Doctor Invite / QR | RegisterDoctorScreen + QrScanScreen | screens/RegisterDoctorScreen.tsx, screens/QrScanScreen.tsx | verifyInvite() (via App.tsx); QR scan = no API | POST /api/v1/auth/invite/verify | REAL API / UI ONLY |
| 5. Home | HomeScreen | screens/HomeScreen.tsx | Нет API вызова, локальные данные | — | MOCK ONLY |
| 6. Screening | RegisterQuestionnaireQuestionScreen | screens/RegisterQuestionnaireQuestionScreen.tsx | submitScreening() (via App.tsx) | POST /api/v1/screenings | REAL API |
| 7. Diary (listing) | DiaryScreen | screens/DiaryScreen.tsx | Нет API, хардкод MOOD/ANXIETY массивы | — | MOCK ONLY |
| 7. Diary (check-in) | CheckInSleepScreen | screens/CheckInSleepScreen.tsx | submitDiaryEntry() (via App.tsx) | POST /api/v1/diary | REAL API |
| 8. Symptoms | SymptomSelectScreen + SymptomDetailScreen | screens/SymptomSelectScreen.tsx, screens/SymptomDetailScreen.tsx | Нет API, локальный выбор симптомов | — | MOCK ONLY |
| 9. Medication (registration) | RegisterMedsScreen | screens/RegisterMedsScreen.tsx | updateMyMedications() (via App.tsx) | PATCH /api/v1/patients/me/medications | REAL API |
| 9. Medication (dosing) | MedicationScreen | screens/MedicationScreen.tsx | Нет API, локальное состояние dosis | — | MOCK ONLY |
| 10. Messages | ChatScreen | screens/ChatScreen.tsx | Нет API, локальное состояние | — | MOCK ONLY |
| 10. Alerts | NotificationsScreen | screens/NotificationsScreen.tsx | Хардкод уведомлений | — | MOCK ONLY |
| 10. Alerts (emergency) | EmergencyHelpScreen | screens/EmergencyHelpScreen.tsx | Нет API | — | UI ONLY |

**Patient Journey verdict:** 6/11 шагов на REAL API, 5/11 на MOCK ONLY/UI ONLY.

## 2. DOCTOR JOURNEY (Frontend Web)

| Шаг | Экран | Файл | API вызов | Endpoint | Статус |
|-----|-------|------|-----------|----------|--------|
| 1. Login | LoginPage | pages/login/LoginPage.tsx | login() -> request() | POST /api/v1/auth/login | REAL API |
| 2. Dashboard | DashboardPage | pages/dashboard/DashboardPage.tsx | get<DashboardResponse>() | GET /api/v1/home/dashboard | REAL API |
| 3. Patients | PatientsPage | pages/patients/PatientsPage.tsx | get<PatientListItem[]>() | GET /api/v1/patients | REAL API |
| 4. Patient Card | PatientCardPage | pages/patient-card/PatientCardPage.tsx | 6 mock-импорта | GET /api/v1/patients/{id}, /card, /summary existent | MOCK ONLY |
| 5. Assessment | Нет отдельного экрана | — | — | — | UNVERIFIED |
| 6. Diagnosis | Нет отдельного экрана | — | — | — | UNVERIFIED |
| 7. Care Plan | TreatmentPlanPage | pages/treatment-plan/TreatmentPlanPage.tsx | getTreatmentPlan() из mock | GET /api/v1/care-plans existent | MOCK ONLY |
| 8. Medication Review | MedicationsPage | pages/medications/MedicationsPage.tsx | findMedications() из mock | GET /api/v1/medications/* existent | MOCK ONLY |
| 9. Alert Review | AlertsPage | pages/alerts/AlertsPage.tsx | alertQueue, alertDetails из mock | GET /api/v1/alerts existent | MOCK ONLY |
| 10. Reports | PreVisitReportsPage | pages/pre-visit-reports/PreVisitReportsPage.tsx | preVisitReportsList из mock | GET /api/v1/reports/* existent | MOCK ONLY |

**Doctor Journey verdict:** 3/10 шагов на REAL API, 4/10 на MOCK ONLY, 3/10 UNVERIFIED (нет экранов assessment/diagnosis).

## 4. API EXIST BUT NOT CONNECTED

| Экран | Файл | Доступные backend endpoints | Статус |
|-------|------|---------------------------|--------|
| Patient Card | pages/patient-card/PatientCardPage.tsx | GET /api/v1/patients/{id}, /card, /summary | MOCK ONLY |
| Alerts | pages/alerts/AlertsPage.tsx | GET /api/v1/alerts | MOCK ONLY |
| Medications | pages/medications/MedicationsPage.tsx | GET /api/v1/medications/* | MOCK ONLY |
| Care Plan | pages/treatment-plan/TreatmentPlanPage.tsx | GET /api/v1/care-plans | MOCK ONLY |
| Profile | pages/profile/ProfilePage.tsx | GET /api/v1/users/me, /practitioners/{id} | MOCK ONLY |
| Audit | pages/admin/audit/AuditPage.tsx | GET /api/v1/audit/* | MOCK ONLY |
| Staff | pages/admin/employees/EmployeesPage.tsx | GET /api/v1/clinics/{id}/members | MOCK ONLY |
| Settings | pages/admin/settings/SettingsPage.tsx | GET /api/v1/clinics/{id}/settings | MOCK ONLY |
| Home (mobile) | screens/HomeScreen.tsx | GET /api/v1/patients/{id}/summary | MOCK ONLY |
| Diary listing (mobile) | screens/DiaryScreen.tsx | GET /api/v1/diary | MOCK ONLY |
| Messages (mobile) | screens/ChatScreen.tsx | GET /api/v1/messages | MOCK ONLY |
| Notifications (mobile) | screens/NotificationsScreen.tsx | GET /api/v1/notifications | MOCK ONLY |

## 5. SECURITY FINDINGS

| # | Находка | Severity | Место |
|---|---------|----------|-------|
| 1 | Admin login использует хардкод DEMO_APP_CODE = '418502' вместо реальной аутентификации | Critical | pages/login/AdminLogin2faPage.tsx:6 |
| 2 | DoctorLayout импортирует моковые данные на уровне макета (все doctor-страницы затрагиваются) | High | layouts/DoctorLayout.tsx:9-10 |
| 3 | Sidebar отображает doctorProfile из мока вместо реального профиля пользователя | High | components/sidebar/Sidebar.tsx:11 |
| 4 | Нет RBAC-проверок на клиенте — любая роль может переходить на любые маршруты DoctorLayout | Medium | app/router.tsx:149-179 |
| 5 | Токены в localStorage без httpOnly флага (MVP, требует согласования) | Medium | lib/api.ts:15-16 |

## 6. CLINICAL WORKFLOW BREAKPOINTS

| # | Брекпоинт | Влияние |
|---|-----------|---------|
| 1 | Врач не видит реальную карточку пациента — только мок "Миронова Анна" | Врач не может оценить состояние реального пациента |
| 2 | Врач не видит реальные алерты — только мок-очередь | Пропуск критичных алертов реальных пациентов |
| 3 | Врач не может создать реальный план лечения — только мок | Нет возможности ведения пациента |
| 4 | Пациент не видит реальный Home экран — только локальные данные | Пациент не получает актуальную информацию |
| 5 | Пациент не видит историю дневника — только хардкод графиков | Нет динамики состояния |
| 6 | Пациент не может отправить реальное сообщение врачу | Разрыв коммуникации врач-пациент |

## 7. МОК ЭКРАНЫ (требуют подключения)

### Frontend (14 экранов):
1. pages/profile/ProfilePage.tsx — mockDoctor
2. pages/patient-card/PatientCardPage.tsx — mockPatientCard, mockDiary, mockPatientMedications, mockProgram, mockQuestionnaires, mockVisits
3. pages/pre-visit-report/PreVisitReportPage.tsx — mockPatientCard, mockPreVisitReport, mockReportPreview
4. pages/alerts/AlertsPage.tsx — mockAlerts
5. pages/medications/MedicationsPage.tsx — mockMedications
6. pages/messages/MessagesPage.tsx — mockMessages
7. pages/exercises/ExercisesPage.tsx — mockExercises, mockPatients
8. pages/treatment-plan/TreatmentPlanPage.tsx — mockTreatmentPlan
9. pages/pre-visit-reports/PreVisitReportsPage.tsx — mockPreVisitReports
10. pages/admin/employees/EmployeesPage.tsx — mockAdmin
11. pages/admin/roles/RolesAccessPage.tsx — mockRolesAccess
12. pages/admin/audit/AuditPage.tsx — mockAccessInviteLog
13. pages/admin/settings/SettingsPage.tsx — mockSettings
14. pages/admin/analytics/AnalyticsPage.tsx — mockAnalytics

### Mobile (8 экранов):
1. screens/HomeScreen.tsx — локальные данные, нет API
2. screens/DiaryScreen.tsx — хардкод MOOD/ANXIETY массивов
3. screens/MedicationScreen.tsx — локальное состояние dosis, нет API
4. screens/ChatScreen.tsx — локальное состояние, нет API
5. screens/NotificationsScreen.tsx — хардкод уведомлений
6. screens/SymptomSelectScreen.tsx — локальный выбор, нет API
7. screens/SymptomDetailScreen.tsx — только навигация, нет API
8. screens/EmergencyHelpScreen.tsx — нет API

## 8. МИНИМАЛЬНЫЙ ПУТЬ ПОДКЛЮЧЕНИЯ (без новых endpoint)

Все необходимые backend endpoints уже существуют. Нужно только заменить импорты mock на вызовы get()/post() из API-клиента:

| Приоритет | Экран | Endpoint | Файл |
|-----------|-------|----------|------|
| 1 | Patient Card | GET /api/v1/patients/{id}/card | pages/patient-card/PatientCardPage.tsx |
| 2 | Alerts | GET /api/v1/alerts | pages/alerts/AlertsPage.tsx |
| 3 | Medications | GET /api/v1/medications | pages/medications/MedicationsPage.tsx |
| 4 | Profile | GET /api/v1/users/me | pages/profile/ProfilePage.tsx |
| 5 | Home (mobile) | GET /api/v1/patients/{id}/summary | screens/HomeScreen.tsx |
| 6 | Diary listing (mobile) | GET /api/v1/diary | screens/DiaryScreen.tsx |
| 7 | Admin Staff | GET /api/v1/clinics/{id}/members | pages/admin/employees/EmployeesPage.tsx |
| 8 | Admin Audit | GET /api/v1/audit/* | pages/admin/audit/AuditPage.tsx |
| 9 | Admin Settings | GET /api/v1/clinics/{id}/settings | pages/admin/settings/SettingsPage.tsx |

## 9. ИТОГОВЫЕ МЕТРИКИ

| Путь | Всего шагов | REAL API | MOCK ONLY | UI ONLY | UNVERIFIED |
|------|-------------|----------|-----------|---------|------------|
| Patient Journey | 11 | 6 | 4 | 1 | 0 |
| Doctor Journey | 10 | 3 | 4 | 0 | 3 |
| Admin Journey | 5 | 0 | 5 | 0 | 0 |
| **Всего** | **26** | **9** | **13** | **1** | **3** |

**Mock экранов всего:** ~34 (фронтенд) + 8 (мобилка) = ~42
**Подключено к REAL API:** 3 экрана фронтенда + частично мобильная регистрация/авторизация

## 3. ADMIN JOURNEY (Frontend Web)

| Шаг | Экран | Файл | API вызов | Endpoint | Статус |
|-----|-------|------|-----------|----------|--------|
| 1. Login | AdminLogin2faPage | pages/login/AdminLogin2faPage.tsx | DEMO_APP_CODE = '418502' хардкод | — | MOCK ONLY |
| 2. Staff | EmployeesPage | pages/admin/employees/EmployeesPage.tsx | employees из mockAdmin | GET /api/v1/clinics/{id}/members existent | MOCK ONLY |
| 3. Roles | RolesAccessPage | pages/admin/roles/RolesAccessPage.tsx | rolesAccessRows из mock | GET /api/v1/clinics/{id}/members (roles) existent | MOCK ONLY |
| 4. Audit | AuditPage | pages/admin/audit/AuditPage.tsx | accessInviteLogMeta из mock | GET /api/v1/audit/* existent | MOCK ONLY |
| 5. Settings | SettingsPage | pages/admin/settings/SettingsPage.tsx | clinicSettings из mock | GET /api/v1/clinics/{id}/settings existent | MOCK ONLY |

**Admin Journey verdict:** 0/5 шагов на REAL API, 5/5 на MOCK ONLY.