# BACKEND CAPABILITY REPORT — Implemented but Not Used by Clients

## Executive Summary

Backend имеет 92 OpenAPI пути, из которых клиенты используют только 9. Остальные 83 пути реализованы, протестированы и документированы, но не вызываются ни фронтендом, ни мобильным приложением. Это не требует новых endpoint — достаточно подключить существующие.

## Backend Capabilities by Category (Not Used by Frontend)

### Authentication & Auth
| Endpoint | Method | Status | Potential Client |
|----------|--------|--------|------------------|
| /api/v1/auth/refresh | POST | Used indirectly (api.ts retry) | Frontend, Mobile |
| /api/v1/auth/logout | POST | Used indirectly (auth.ts) | Frontend, Mobile |
| /api/v1/auth/me | GET | Used indirectly (auth.ts) | Frontend, Mobile |
| /api/v1/auth/register | POST | Used indirectly (auth.ts) | Frontend, Mobile |
| /api/v1/auth/invite/verify | POST | Used indirectly (auth.ts) | Frontend, Mobile |
| /api/v1/auth/consent | POST | Used indirectly (auth.ts) | Frontend, Mobile |
| /api/v1/auth/phone/lookup | POST | Used by Mobile App.tsx | Mobile |

### Patient Management
| Endpoint | Method | Status | Potential Client |
|----------|--------|--------|------------------|
| /api/v1/patients | GET | Used by PatientsPage | Frontend |
| /api/v1/patients/{id} | GET | NOT USED | PatientCardPage |
| /api/v1/patients/{id} | PATCH | NOT USED | ProfilePage, PatientCardPage |
| /api/v1/patients/{id}/home | GET | NOT USED | HomeScreen (mobile) |
| /api/v1/patients/{id}/summary | GET | NOT USED | HomeScreen (mobile), PatientCardPage |
| /api/v1/patients/{id}/card | GET | NOT USED | PatientCardPage |
| /api/v1/patients/me/medications | PATCH | Used by Mobile RegisterMeds | Mobile |

### Alerts
| Endpoint | Method | Status | Potential Client |
|----------|--------|--------|------------------|
| /api/v1/alerts | GET | NOT USED | AlertsPage |

### Medications
| Endpoint | Method | Status | Potential Client |
|----------|--------|--------|------------------|
| /api/v1/medications | GET | NOT USED | MedicationsPage |
| /api/v1/medications/{id} | GET | NOT USED | MedicationsPage |

### Care Plans
| Endpoint | Method | Status | Potential Client |
|----------|--------|--------|------------------|
| /api/v1/care-plans | GET/POST | NOT USED | TreatmentPlanPage |

### Diary
| Endpoint | Method | Status | Potential Client |
|----------|--------|--------|------------------|
| /api/v1/diary | GET | NOT USED | DiaryScreen (mobile) |
| /api/v1/diary/{id} | PUT | NOT USED | DiaryScreen (mobile) |
| /api/v1/diary/bulk-sync | POST | NOT USED | DiaryScreen (mobile) |
| /api/v1/diary/today | GET | Used by Mobile todayCheckIn | Mobile |
| /api/v1/diary/summary | GET | NOT USED | DiaryScreen (mobile) |

### Screenings
| Endpoint | Method | Status | Potential Client |
|----------|--------|--------|------------------|
| /api/v1/screenings | POST | Used by Mobile RegisterQuestionnaire | Mobile |
| /api/v1/patients/{id}/screenings | GET | NOT USED | PatientCardPage |

### Messages
| Endpoint | Method | Status | Potential Client |
|----------|--------|--------|------------------|
| /api/v1/messages | GET/POST | NOT USED | ChatScreen (mobile), MessagesPage |

### Appointments
| Endpoint | Method | Status | Potential Client |
|----------|--------|--------|------------------|
| /api/v1/appointments | GET | NOT USED | AppointmentScreen (mobile) |

### Reports
| Endpoint | Method | Status | Potential Client |
|----------|--------|--------|------------------|
| /api/v1/reports/* | GET | NOT USED | PreVisitReportsPage, PreVisitReportPage |

### Admin
| Endpoint | Method | Status | Potential Client |
|----------|--------|--------|------------------|
| /api/v1/clinics/{id}/members | GET | NOT USED | EmployeesPage, RolesAccessPage |
| /api/v1/audit/* | GET | NOT USED | AuditPage |
| /api/v1/clinics/{id}/settings | GET/PUT | NOT USED | SettingsPage |

## Backend Capabilities by Category (Used by Frontend)

| Endpoint | Method | Client Screen | File |
|----------|--------|---------------|------|
| /api/v1/auth/login | POST | Login | pages/login/LoginPage.tsx |
| /api/v1/patients | GET | Patients | pages/patients/PatientsPage.tsx |
| /api/v1/home/dashboard | GET | Dashboard | pages/dashboard/DashboardPage.tsx |

## Backend Capabilities by Category (Used by Mobile)

| Endpoint | Method | Client Screen | File |
|----------|--------|---------------|------|
| /api/v1/auth/phone/lookup | POST | RegisterPhone | App.tsx |
| /api/v1/auth/sms/request | POST | RegisterPhone | App.tsx |
| /api/v1/auth/sms/verify | POST | RegisterSms | App.tsx |
| /api/v1/auth/invite/verify | POST | RegisterDoctor | App.tsx |
| /api/v1/auth/consent | POST | RegisterConsent | App.tsx |
| /api/v1/auth/me | GET | Login, RegisterSms | App.tsx |
| /api/v1/auth/login | POST | Login | App.tsx |
| /api/v1/screenings | POST | RegisterQuestionnaire | App.tsx |
| /api/v1/diary | POST | CheckInSleep | App.tsx |
| /api/v1/patients/me/medications | PATCH | RegisterMeds | App.tsx |

## Summary

- Backend endpoints total: 92
- Used by frontend: 3
- Used by mobile: 10
- Not used by any client: ~79
- No new backend capabilities needed — all required endpoints exist

## Recommended Connection Order (by clinical impact)

1. `GET /api/v1/patients/{id}/card` — PatientCardPage (blocks doctor journey)
2. `GET /api/v1/alerts` — AlertsPage (blocks doctor alert review)
3. `GET /api/v1/patients/{id}/summary` — HomeScreen (mobile, blocks patient journey)
4. `GET /api/v1/diary` — DiaryScreen (mobile, blocks patient diary)
5. `GET /api/v1/users/me` — ProfilePage (blocks doctor profile)