/**
 * Frontend API client (fetch-based, no new dependencies).
 *
 * Wraps the Clinical Compass backend `{ data, meta, error }` envelope.
 * Reads base URL from VITE_API_URL (defaults to http://localhost:3001).
 * Stores JWT access/refresh tokens in localStorage and retries once on 401
 * after a refresh. All mutations go through this client so the frontend stays
 * in sync with the backend contract (see docs/CLIENT_MAPPING.md).
 */

import type { Envelope } from "@/types/api";

const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

const ACCESS_KEY = "cc_access_token";
const REFRESH_KEY = "cc_refresh_token";

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function getAccessToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function setTokens(access: string, refresh: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const env = (await res.json()) as Envelope<{ access_token: string; refresh_token: string }>;
    if (env.error || !env.data) {
      clearTokens();
      return null;
    }
    setTokens(env.data.access_token, env.data.refresh_token);
    return env.data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export function getToken(): string | null {
  return getAccessToken();
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function clearAuth(): void {
  clearTokens();
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  retryOn401?: boolean;
}

export async function request<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, retryOn401 = true } = opts;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retryOn401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, { ...opts, retryOn401: false });
    }
    clearTokens();
    throw new ApiError("Сессия истекла", 401, "unauthorized");
  }

  let parsed: Envelope<T> | null = null;
  try {
    parsed = (await res.json()) as Envelope<T>;
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    const msg = parsed?.error?.message ?? `HTTP ${res.status}`;
    const code = parsed?.error?.code;
    throw new ApiError(msg, res.status, code);
  }
  if (parsed?.error) {
    throw new ApiError(parsed.error.message, res.status, parsed.error.code);
  }
  return (parsed?.data as T) ?? (undefined as unknown as T);
}

export async function get<T = unknown>(path: string, opts?: Omit<RequestOptions, "method">): Promise<T> {
  return request<T>(path, { ...opts, method: "GET" });
}

export async function post<T = unknown>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">): Promise<T> {
  return request<T>(path, { ...opts, method: "POST", body });
}

export async function put<T = unknown>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">): Promise<T> {
  return request<T>(path, { ...opts, method: "PUT", body });
}

export async function patch<T = unknown>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">): Promise<T> {
  return request<T>(path, { ...opts, method: "PATCH", body });
}

export async function del<T = unknown>(path: string, opts?: Omit<RequestOptions, "method">): Promise<T> {
  return request<T>(path, { ...opts, method: "DELETE" });
}
