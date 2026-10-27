import { request } from "./client";
import {
  toMoodScore,
  fromMoodScore,
  toZeroToFour,
  fromZeroToFour,
  minutesToSleepHours,
  sleepHoursToMinutes,
} from "./mappers";

export interface DiaryEntry {
  id: string;
  patient_id: string;
  recorded_at: string | null;
  mood_score: number | null;
  anxiety_score: number | null;
  energy_score: number | null;
  functioning_score: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  notes: string | null;
  device_id: string | null;
  synced_at: string | null;
  created_at: string | null;
}

export interface MobileCheckInInput {
  mood: number;
  anxiety: number;
  sleepMinutes: number;
  recordedAt?: string | Date;
  notes?: string | null;
  deviceId?: string;
  energy?: number | null;
  functioning?: number | null;
  sleepQuality?: number | null;
}

export interface MobileDiaryEntry {
  id: string;
  patientId: string;
  recordedAt: string | null;
  mood: number | null;
  anxiety: number | null;
  energy: number | null;
  functioning: number | null;
  sleepMinutes: number | null;
  sleepQuality: number | null;
  notes: string | null;
}

export function toDiaryPayload(input: MobileCheckInInput): Record<string, unknown> {
  const recordedAt =
    input.recordedAt instanceof Date
      ? input.recordedAt.toISOString()
      : input.recordedAt ?? new Date().toISOString();

  return {
    recorded_at: recordedAt,
    mood_score: toMoodScore(input.mood),
    anxiety_score: toZeroToFour(input.anxiety),
    energy_score:
      input.energy == null ? null : toZeroToFour(input.energy),
    functioning_score:
      input.functioning == null ? null : toZeroToFour(input.functioning),
    sleep_hours: minutesToSleepHours(input.sleepMinutes),
    sleep_quality:
      input.sleepQuality == null ? null : toZeroToFour(input.sleepQuality),
    notes: input.notes ?? null,
    device_id: input.deviceId,
  };
}

export function fromDiaryEntry(entry: DiaryEntry): MobileDiaryEntry {
  return {
    id: entry.id,
    patientId: entry.patient_id,
    recordedAt: entry.recorded_at,
    mood: entry.mood_score == null ? null : fromMoodScore(entry.mood_score),
    anxiety:
      entry.anxiety_score == null ? null : fromZeroToFour(entry.anxiety_score),
    energy:
      entry.energy_score == null ? null : fromZeroToFour(entry.energy_score),
    functioning:
      entry.functioning_score == null
        ? null
        : fromZeroToFour(entry.functioning_score),
    sleepMinutes:
      entry.sleep_hours == null ? null : sleepHoursToMinutes(entry.sleep_hours),
    sleepQuality:
      entry.sleep_quality == null ? null : fromZeroToFour(entry.sleep_quality),
    notes: entry.notes,
  };
}

export async function submitDiaryEntry(input: MobileCheckInInput): Promise<DiaryEntry> {
  return request<DiaryEntry>("/api/v1/diary", {
    method: "POST",
    body: toDiaryPayload(input),
  });
}

export async function updateDiaryEntry(
  entryId: string,
  input: Partial<MobileCheckInInput>,
): Promise<DiaryEntry> {
  const body: Record<string, unknown> = {};
  if (input.recordedAt !== undefined) {
    body.recorded_at =
      input.recordedAt instanceof Date
        ? input.recordedAt.toISOString()
        : input.recordedAt;
  }
  if (input.mood !== undefined) body.mood_score = toMoodScore(input.mood);
  if (input.anxiety !== undefined) body.anxiety_score = toZeroToFour(input.anxiety);
  if (input.energy !== undefined)
    body.energy_score =
      input.energy == null ? null : toZeroToFour(input.energy);
  if (input.functioning !== undefined)
    body.functioning_score =
      input.functioning == null ? null : toZeroToFour(input.functioning);
  if (input.sleepMinutes !== undefined)
    body.sleep_hours = minutesToSleepHours(input.sleepMinutes);
  if (input.sleepQuality !== undefined)
    body.sleep_quality =
      input.sleepQuality == null ? null : toZeroToFour(input.sleepQuality);
  if (input.notes !== undefined) body.notes = input.notes;
  return request<DiaryEntry>(`/api/v1/diary/${entryId}`, {
    method: "PUT",
    body,
  });
}

export async function bulkSyncDiary(
  deviceId: string,
  entries: MobileCheckInInput[],
): Promise<{ created: number; skipped: number; items: DiaryEntry[] }> {
  const payload = {
    device_id: deviceId,
    entries: entries.map((entry) => {
      const p = toDiaryPayload(entry) as Record<string, unknown>;
      // bulk endpoint expects recorded_at and no device_id per entry
      delete p.device_id;
      return p;
    }),
  };
  const data = await request<{
    created: number;
    skipped: number;
    items: DiaryEntry[];
  }>("/api/v1/diary/bulk-sync", { method: "POST", body: payload });
  return data;
}

export async function todayCheckIn(): Promise<{
  patient_id: string;
  date: string;
  entry: DiaryEntry | null;
  completed: boolean;
}> {
  return request("/api/v1/diary/today", { method: "GET" });
}

export async function listDiary(params?: {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: DiaryEntry[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.dateFrom) q.set("date_from", params.dateFrom);
  if (params?.dateTo) q.set("date_to", params.dateTo);
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return request(`/api/v1/diary${suffix}`, { method: "GET" });
}

export async function diarySummary(params?: {
  dateFrom?: string;
  dateTo?: string;
}): Promise<Record<string, unknown>> {
  const q = new URLSearchParams();
  if (params?.dateFrom) q.set("date_from", params.dateFrom);
  if (params?.dateTo) q.set("date_to", params.dateTo);
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return request(`/api/v1/diary/summary${suffix}`, { method: "GET" });
}
