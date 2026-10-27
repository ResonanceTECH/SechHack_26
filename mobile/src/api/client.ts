import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./storage";

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export interface Envelope<T = unknown> {
  data: T;
  meta: { request_id: string; timestamp: string };
  error: { code: string; message: string } | null;
}

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

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) {
      await clearTokens();
      return null;
    }
    const env = (await res.json()) as Envelope<{ access_token: string; refresh_token: string }>;
    if (env.error || !env.data) {
      await clearTokens();
      return null;
    }
    await setTokens(env.data.access_token, env.data.refresh_token);
    return env.data.access_token;
  } catch {
    await clearTokens();
    return null;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
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
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retryOn401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, { ...opts, retryOn401: false });
    }
  }

  let parsed: Envelope<T> | null = null;
  try {
    parsed = (await res.json()) as Envelope<T>;
  } catch {
    // non-json response
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

export async function getHealth() {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error(`health ${res.status}`);
  return res.json() as Promise<{ ok: boolean }>;
}

export async function getDbHealth() {
  const res = await fetch(`${API_URL}/db/health`);
  if (!res.ok) throw new Error(`db/health ${res.status}`);
  return res.json() as Promise<{ ok: boolean; now?: string; db?: string }>;
}
