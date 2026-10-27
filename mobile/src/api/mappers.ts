// Client-side adapters between mobile 1–5 smiley scales and backend clinical scales.
// Backend scales are NOT changed; conversions happen only in the mobile API layer.

export type MobileScale = 1 | 2 | 3 | 4 | 5;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const round = (value: number): number => Math.round(value);

/** Mobile mood 1–5 -> backend mood -2..2 (-3/+3 reserved for clinical/manual input). */
export function toMoodScore(mobile: number): number {
  const m = clamp(round(mobile), 1, 5);
  return clamp(m - 3, -2, 2);
}

/** Backend mood -3..3 -> mobile mood 1–5. */
export function fromMoodScore(backend: number): number {
  const b = clamp(round(backend), -3, 3);
  return clamp(b + 3, 1, 5);
}

/** Mobile anxiety/energy/functioning/sleep quality 1–5 -> backend 0..4. */
export function toZeroToFour(mobile: number): number {
  const m = clamp(round(mobile), 1, 5);
  return clamp(m - 1, 0, 4);
}

/** Backend anxiety/energy/functioning/sleep quality 0..4 -> mobile 1–5. */
export function fromZeroToFour(backend: number): number {
  const b = clamp(round(backend), 0, 4);
  return clamp(b + 1, 1, 5);
}

/** Mobile sleep duration minutes -> backend sleep_hours float. */
export function minutesToSleepHours(minutes: number): number {
  const safe = Number.isFinite(minutes) ? minutes : 0;
  return Math.max(0, safe) / 60;
}

/** Backend sleep_hours float -> mobile sleep duration minutes. */
export function sleepHoursToMinutes(hours: number): number {
  const safe = Number.isFinite(hours) ? hours : 0;
  return Math.max(0, Math.round(safe * 60));
}
