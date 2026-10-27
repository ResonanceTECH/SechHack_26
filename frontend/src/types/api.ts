/** Frontend TypeScript types mirroring backend DTOs (see app/schemas/*). */
export interface Envelope<T = unknown> {
  data: T;
  meta: { request_id: string; timestamp: string };
  error: { code: string; message: string } | null;
}

export interface PatientListItem {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserBrief {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  first_name: string | null;
  last_name: string | null;
}

export interface MeResponse {
  user: UserBrief;
  consent_personal_data: boolean;
  consent_medical_data: boolean;
  consent_data_sharing_with_doctor: boolean;
  has_patient_profile: boolean;
}

export interface DashboardResponse {
  role: string;
  practitioner: {
    id: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    middle_name: string | null;
    specialization: string | null;
    clinic_id: string | null;
    is_active: boolean;
  } | null;
  stats: { active_patients: number; new_alerts: number; appointments_today: number };
  alerts: { active: number; items: AlertItem[] };
  appointments_today: AppointmentItem[];
  recent_patients: PatientListItem[];
}

export interface AlertItem {
  id: string;
  patient_id: string;
  patient_name: string | null;
  type: string | null;
  priority: string | null;
  status: string | null;
  title: string | null;
  summary: string | null;
  created_at: string | null;
}

export interface AppointmentItem {
  id: string;
  patient_id: string;
  patient_name: string | null;
  scheduled_at: string;
  status: string | null;
  reason: string | null;
}

/** Backend GET /api/v1/patients/{id}/card response (aggregated summary + home). */
export interface PatientCardApiResponse {
  id: string;
  full_name: string | null;
  short_name: string | null;
  initials: string | null;
  age: number | null;
  diagnosis_code: string | null;
  in_program_since: string | null;
  lead_doctor: string | null;
  badges: Array<{ id: string; label: string; tone: string; with_calendar?: boolean }>;
  alert: {
    id: string;
    priority_label: string;
    title: string;
    body: string;
    cta: string;
  } | null;
  diary: {
    title: string;
    footnote: string;
    points: Array<{ day: number; mood: number | null; anxiety: number | null; sleep: number | null; worsen_zone?: boolean; gap?: boolean }>;
  };
  questionnaires: Array<{
    id: string;
    code: string;
    score: number;
    max: number;
    previous: number;
    trend: 'up' | 'down' | 'same';
    trend_label: string;
    dates: string[];
    bars: number[];
    note?: string;
  }>;
  program: {
    title: string;
    week_progress: number;
    week_label: string;
    tasks: Array<{ id: string; title: string; status: string; status_label: string; progress_label?: string }>;
  };
  medication: {
    name: string;
    dose: string;
    schedule: string;
    adherence: number;
    side_effects: string;
    warnings: string;
    contour_label: string;
  } | null;
  summary: {
    title: string;
    body: string;
    based_on: string;
    decision_note: string;
  };
  home: {
    patient: Record<string, unknown>;
    alerts: { active: number };
    latest_diary: Record<string, unknown> | null;
    next_appointment: Record<string, unknown> | null;
    today_tasks: Array<{ type: string; title: string; completed: boolean; related_id?: string; scheduled_at?: string }>;
  };
}

/** Backend GET /api/v1/home/dashboard response for patient role (mobile home screen). */
export interface HomeDashboardPatientResponse {
  role: string;
  user_id: string;
  patient_home: {
    patient: Record<string, unknown>;
    alerts: { active: number };
    latest_diary: Record<string, unknown> | null;
    next_appointment: Record<string, unknown> | null;
    today_tasks: Array<{ type: string; title: string; completed: boolean }>;
  } | null;
  [key: string]: unknown;
}
