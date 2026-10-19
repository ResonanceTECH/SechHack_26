const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

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
