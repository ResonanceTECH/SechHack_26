import { request } from "./client";

export async function updateMyMedications(payload: {
  current_medications?: string[];
  allergy_status?: "no" | "yes" | "unknown";
  taking_no_medications?: boolean;
}): Promise<unknown> {
  return request("/api/v1/patients/me/medications", {
    method: "PATCH",
    body: payload,
  });
}