/**
 * Auth helpers backed by the real backend /api/v1/auth/* endpoints.
 *
 * Replaces the mock doctorAuth (localStorage kk-doctor-auth) with JWT
 * access/refresh tokens obtained from /api/v1/auth/login, /api/v1/auth/refresh,
 * /api/v1/auth/logout and /api/v1/auth/me.
 */

import { clearTokens, getAccessToken, isAuthenticated, request, setTokens } from "./api";

const REFRESH_KEY = "cc_refresh_token";

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

/** ログイン (email + password). Сохраняет пару токенов в localStorage. */
export async function login(email: string, password: string): Promise<TokenPair> {
  const data = await request<TokenPair>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setTokens(data.access_token, data.refresh_token);
  return data;
}

/** Получить профиль текущего пользователя. */
export async function me(): Promise<MeResponse> {
  return request<MeResponse>("/api/v1/auth/me", { method: "GET" });
}

/** Обновить access-токен по refresh-токену. */
export async function refresh(): Promise<TokenPair | null> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;
  try {
    const data = await request<TokenPair>("/api/v1/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
      auth: false,
    });
    setTokens(data.access_token, data.refresh_token);
    return data;
  } catch {
    logout();
    return null;
  }
}

/** Выйти: вызвать /logout и очистить локальные токены. */
export async function logout(): Promise<void> {
  try {
    const rt = localStorage.getItem(REFRESH_KEY);
    if (rt) {
      await request("/api/v1/auth/logout", {
        method: "POST",
        body: { refresh_token: rt },
        auth: true,
      });
    }
  } finally {
    clearTokens();
  }
}

/** Зарегистрировать нового пользователя (email + пароль). */
export async function register(body: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  consent_personal_data: boolean;
  consent_medical_data: boolean;
}): Promise<TokenPair> {
  const data = await request<TokenPair>("/api/v1/auth/register", {
    method: "POST",
    body,
    auth: false,
  });
  setTokens(data.access_token, data.refresh_token);
  return data;
}

/** Подтвердить invite-код (врач → привязка пациента к клинике). */
export async function verifyInvite(code: string): Promise<{
  assigned: boolean;
  practitioner_id: string;
  clinic_id: string;
}> {
  return request("/api/v1/auth/invite/verify", {
    method: "POST",
    body: { code },
    auth: true,
  });
}

/** Сохранить согласия 152-ФЗ. */
export async function storeConsent(payload: {
  consent_personal_data: boolean;
  consent_medical_data: boolean;
  consent_data_sharing_with_doctor: boolean;
}): Promise<void> {
  await request("/api/v1/auth/consent", {
    method: "POST",
    body: payload,
    auth: true,
  });
}

/** Токен доступа для заголовков Authorization (если нужен вне api.ts). */
export function getAccessTokenValue(): string | null {
  return getAccessToken();
}

export { isAuthenticated, clearTokens as clearAuthTokens };
