import { request } from "./client";
import { setTokens, clearTokens } from "./storage";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export async function lookupPhone(phone: string): Promise<{ exists: boolean; has_patient_profile: boolean }> {
  return request<{ exists: boolean; has_patient_profile: boolean }>("/api/v1/auth/phone/lookup", {
    method: "POST",
    body: { phone },
    auth: false,
  });
}
export async function requestSms(phone: string): Promise<{ status: string; dev_code?: string }> {
  return request<{ status: string; dev_code?: string }>("/api/v1/auth/sms/request", {
    method: "POST",
    body: { phone },
    auth: false,
  });
}

export async function loginEmail(email: string, password: string): Promise<TokenPair> {
  const data = await request<TokenPair>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  await setTokens(data.access_token, data.refresh_token);
  return data;
}
export async function verifySms(phone: string, code: string): Promise<TokenPair> {
  const data = await request<TokenPair>("/api/v1/auth/sms/verify", {
    method: "POST",
    body: { phone, code },
    auth: false,
  });
  await setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function verifyInvite(code: string): Promise<{ assigned: boolean; practitioner_id: string; clinic_id: string }> {
  return request("/api/v1/auth/invite/verify", {
    method: "POST",
    body: { code },
    auth: true,
  });
}

export async function storeConsent(
  consent_personal_data: boolean,
  consent_medical_data: boolean,
  consent_data_sharing_with_doctor: boolean,
): Promise<unknown> {
  return request("/api/v1/auth/consent", {
    method: "POST",
    body: { consent_personal_data, consent_medical_data, consent_data_sharing_with_doctor },
    auth: true,
  });
}

export async function getMe(): Promise<{ user: { id: string; email: string | null; phone: string | null; role: string; first_name: string | null; last_name: string | null }; consent_personal_data: boolean; consent_medical_data: boolean; consent_data_sharing_with_doctor: boolean; has_patient_profile: boolean }> {
  return request("/api/v1/auth/me", { method: "GET", auth: true });
}

export async function logout(): Promise<void> {
  try {
    const { getRefreshToken } = await import("./storage");
    const rt = await getRefreshToken();
    await request("/api/v1/auth/logout", {
      method: "POST",
      body: { refresh_token: rt },
      auth: true,
    });
  } finally {
    await clearTokens();
  }
}