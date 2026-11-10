import type { Countdown } from "../types";
import { NAME_MAX_LENGTH, normaliseName } from "./countdown";
import { isValidKey, makeKey, parseKey, type DateKey } from "./date";

export const STORAGE_KEY = "countdowns:v1";

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Keeps only well-formed entries, so hand-edited or stale data can't break the app. */
function sanitise(raw: unknown): Countdown[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { countdowns?: unknown }).countdowns)
      ? (raw as { countdowns: unknown[] }).countdowns
      : [];

  const seen = new Set<string>();
  const result: Countdown[] = [];

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const { id, name, date, createdAt } = item as Record<string, unknown>;

    if (typeof id !== "string" || id.length === 0 || seen.has(id)) continue;
    if (typeof name !== "string" || !isValidKey(date)) continue;

    const cleaned = normaliseName(name).slice(0, NAME_MAX_LENGTH);
    if (cleaned.length === 0) continue;

    seen.add(id);
    result.push({
      id,
      name: cleaned,
      date,
      createdAt: typeof createdAt === "number" && Number.isFinite(createdAt) ? createdAt : 0,
    });
  }

  return result;
}

/** Returns null when nothing has ever been saved on this device. */
export function loadCountdowns(): Countdown[] | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;
    return sanitise(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function saveCountdowns(countdowns: Countdown[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, countdowns }));
  } catch {
    // Storage can be unavailable (private mode, quota). The app keeps working in memory.
  }
}

const STARTERS = [
  { name: "New Year’s Day", month: 0, day: 1 },
  { name: "Valentine’s Day", month: 1, day: 14 },
  { name: "Halloween", month: 9, day: 31 },
  { name: "Christmas", month: 11, day: 25 },
];

/**
 * A few familiar dates for the very first visit, so the dashboard opens with
 * something to look at. They are ordinary countdowns: editable and deletable.
 */
export function createStarterCountdowns(today: DateKey): Countdown[] {
  const year = parseKey(today)?.year ?? new Date().getFullYear();
  const now = Date.now();

  return STARTERS.map((starter) => {
    const thisYear = makeKey(year, starter.month, starter.day);
    const date = thisYear < today ? makeKey(year + 1, starter.month, starter.day) : thisYear;
    return { name: starter.name, date };
  })
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 3)
    .map((starter, index) => ({ id: createId(), ...starter, createdAt: now + index }));
}
