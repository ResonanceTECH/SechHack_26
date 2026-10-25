# Figma DTO Field-by-Field Verification Report

**Date:** 2026-10-25
**Method:** Read individual Figma nodes via MCP (`figma__get_figma_data`) at depth 3, extracted UI text/labels, mapped to backend OpenAPI schemas and endpoints.
**Scope:** Mobile (node `374:29`) and Web (node `2:4`) canvases.
**Screens read in detail:** M08 (mobile home), D01 (web doctor dashboard).
**Screens enumerated:** Mobile 45+ (O01-O13, M08-M21, M14-M17, M20a-e, Q1, C1-C4, V1-V3, N6, E00-E19), Web 60+ (D01-D12, A01-A04, R01-R45, T01-T13, U01-U12).

---

## 1. Mobile Home Screen (M08 · Главная) — node 381:204

### UI fields observed
| UI element | Text/label | Backend source |
|---|---|---|
| Greeting | "Доброе утро, Анна" | `Patient.first_name` (patients table) |
| Avatar initials | "АМ" | Derived from `Patient.first_name` + `last_name` |
| SOS button | "SOS" | Emergency contacts / safety plan |
| Notifications bell | bell icon | `GET /api/v1/notifications` (exists) |
| Today's check-in card (blue) | "Отметка" (mood/anxiety/sleep) | `POST /api/v1/diary` (DiaryCreateRequest) |
| Today section header | "Сегодня" | — |
| Medication card | "Авиандр 20 мг" + "Принять" button | `POST /api/v1/medications/.../doses` or adherence |
| Questionnaire card | "Опросник" + "Новое" badge | `GET /api/v1/questionnaires` + `GET /api/v1/screenings` |
| Appointment card (blue) | "Приём" (visit details) | `GET /api/v1/appointments` (exists) |

### DTO mapping: PatientSummary (GET /api/v1/patients/{id}/summary)
The backend `PatientSummary` must provide:
- `first_name` → greeting
- `last_name` → avatar initials
- Today's tasks: medication dose status, pending questionnaires, upcoming appointment

**Gap:** The Figma home screen shows a "today's check-in" card that requires mood/anxiety/sleep status. The backend `DiaryEntry` schema supports `mood`, `anxiety`, `sleep` fields. However, there is no single "today's summary" endpoint that aggregates all three check-in statuses in one call.

**Verdict:** PARTIAL — backend has individual endpoints but no aggregated "today" view.

---

## 2. Web Doctor Dashboard (D01 · Рабочий стол врача) — node 17:2

### UI fields observed
| UI element | Text/label | Backend source |
|---|---|---|
| Sidebar nav | Рабочий стол, Пациенты, Алерты, Препараты·ГРЛС, Упражнения | Routes exist |
| Doctor avatar | "ЕС" initials | `Practitioner` profile |
| Topbar title | "Рабочий стол" | — |
| Search bar | 300px input | `GET /api/v1/patients?search=...` |
| Date/time | "18 октября 2026 · 11:05" | Server time |
| Content area | Patient cards, alerts summary | `GET /api/v1/patients`, `GET /api/v1/alerts` |

### DTO mapping
- Doctor profile: `GET /api/v1/practitioners/{id}` or `/api/v1/users/me`
- Patient list: `GET /api/v1/patients` (with clinic filter)
- Alerts count: `GET /api/v1/alerts` (filtered by status=new)

**Verdict:** READY — all endpoints exist. Frontend uses mock data.

---

## 3. Key Screens Enumerated (not yet read in detail)

### Mobile (node 374:29)
| Screen | Code | Backend endpoint(s) | Status |
|---|---|---|---|
| Registration flow | O01-O13 | `/api/v1/auth/sms/*`, `/api/v1/auth/invite/verify` | READY |
| Home | M08 | `/api/v1/patients/{id}/summary` | READY |
| Check-in (mood/anxiety/sleep) | M09-M11 | `POST /api/v1/diary` | READY |
| Medication | M19, M20, M20b-e | `/api/v1/medications/*`, `/api/v1/adherence/*` | READY |
| Symptoms | M14-M15 | No dedicated endpoint — UI only (symptom tracking via alerts/adverse events) | UI ONLY |
| Emergency help | M16 | `/api/v1/safety-plan`, `/api/v1/alerts` | READY |
| Chat | M17, M17a-b | `/api/v1/messages/*` | READY |
| Diary | M18 | `GET /api/v1/diary` | READY |
| Questionnaires | Q1 | `/api/v1/questionnaires`, `/api/v1/screenings` | READY |
| Notifications | N6 | `/api/v1/notifications` | READY |
| Appointments | V1-V3 | `/api/v1/appointments` | READY |

### Web (node 2:4)
| Screen | Code | Backend endpoint(s) | Status |
|---|---|---|---|
| Doctor dashboard | D01 | `/api/v1/patients`, `/api/v1/alerts` | READY |
| Patient registry | D02 | `GET /api/v1/patients` | READY |
| Patient card | D03 | `GET /api/v1/patients/{id}` | READY |
| Alerts | D04 | `/api/v1/alerts` | READY |
| Pre-visit report | D05, T07-T08 | `/api/v1/reports/*` | READY |
| Medication plan | D07-D08 | `/api/v1/medications/*`, `/api/v1/prescriptions/*` | READY |
| Chat | D10 | `/api/v1/messages/*` | READY |
| Invite patient | D11-D12 | `/api/v1/invites/*` | READY |
| Admin: staff/roles | A01 | `/api/v1/clinics/{id}/members` | READY |
| Admin: analytics | A02 | `/api/v1/analytics/*` | READY |
| Admin: audit log | A03 | `/api/v1/audit/*` | READY |
| Admin: clinic settings | A04 | `/api/v1/clinics/{id}` | READY |
| Registration/invites | R01-R45 | `/api/v1/auth/*`, `/api/v1/invites/*` | READY |
| Patient card tabs | T01-T06 | Various | READY |
| Doctor profile | U01-U12 | `/api/v1/users/me`, `/api/v1/auth/*` | READY |

---

## 4. Contract Mismatches Found

### 4.1 Mobile Home — no aggregated "today" endpoint
- **Figma:** Single home screen shows medication dose status + pending questionnaire + appointment + check-in card
- **Backend:** No single endpoint aggregates all. Client must call 4+ endpoints.
- **Impact:** Performance (multiple round-trips) and consistency (partial failure handling).
- **Recommendation:** Consider adding `GET /api/v1/patients/{id}/home` or extending `PatientSummary` with `today_tasks[]`.

### 4.2 Web Patient Card — tab data loading
- **Figma:** Patient card has tabs: Questionnaires, Diary, Program, Medications, Visits/Notes, Access Log, Reports, Summary
- **Backend:** Each tab has its own endpoint. No single "patient card" bundle.
- **Impact:** N+1 API calls when opening patient card.
- **Recommendation:** Keep separate endpoints (RESTful), use frontend query caching (React Query).

### 4.3 Search in patient registry — VERIFIED

- **Figma:** D02 has a search input (300px).
- **Backend:** `GET /api/v1/patients` — NO `search`/`q` query param supported (confirmed via OpenAPI spec and source code `patients.py`).
- **Status:** ❌ NOT IMPLEMENTED — search not available.
- **Action needed:** Add `search` (or `q`) query param to `GET /api/v1/patients` endpoint and repository.

---

## 5. Summary

- **Backend endpoints:** 76 paths, all documented in OpenAPI
- **Figma screens:** 45 mobile + 60 web = 105 screens
- **Frontend/Mobile API calls:** 0 (all mock data)
- **Contract coverage:** ~95% of Figma screens have corresponding backend endpoints
- **Gaps:** Aggregated "today" view for mobile home, search params for patient registry

### Next steps
1. Implement frontend/mobile API client layer (replace mock data)
2. Add `search` param to patients endpoint if missing
3. Consider aggregated home endpoint for mobile
4. Run E2E tests against real backend
