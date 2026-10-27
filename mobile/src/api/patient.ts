import { request } from "./client";

export interface PatientHomeDashboard {
  role: string;
  user_id: string;
  patient_home: {
    patient: {
      id: string;
      first_name: string | null;
      last_name: string | null;
    } | null;
    alerts: { active: number };
    latest_diary: Record<string, unknown> | null;
    next_appointment: Record<string, unknown> | null;
    today_tasks: Array<{ type: string; title: string; completed: boolean }>;
  } | null;
  [key: string]: unknown;
}

export async function getHomeDashboard(): Promise<PatientHomeDashboard> {
  return request<PatientHomeDashboard>("/api/v1/home/dashboard", {
    method: "GET",
    auth: true,
  });
}

export function buildNameAndInitials(
  firstName: string | null,
  lastName: string | null,
): { name: string; initials: string } {
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  const name = [first, last].filter(Boolean).join(" ") || "Пациент";
  const initials =
    (first.charAt(0) || "") + (last.charAt(0) || "") || "??";
  return { name, initials: initials.toUpperCase() };
}