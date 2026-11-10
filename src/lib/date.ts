/**
 * Calendar-date helpers.
 *
 * A countdown targets a calendar day, not an instant, so dates are stored as
 * plain "YYYY-MM-DD" keys with no time or zone attached. "Today" is read from
 * the device's local clock, and all arithmetic runs on UTC midnights so a
 * daylight-saving shift can never make a day 23 or 25 hours long.
 */

/** A calendar day in ISO form, e.g. "2026-12-25". Sorts correctly as a string. */
export type DateKey = string;

export interface DateParts {
  year: number;
  /** 0 = January */
  month: number;
  day: number;
}

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2999;

const MS_PER_DAY = 86_400_000;
const KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number, length = 2) => String(value).padStart(length, "0");

export function makeKey(year: number, month: number, day: number): DateKey {
  return `${pad(year, 4)}-${pad(month + 1)}-${pad(day)}`;
}

/** The current calendar day in the user's local time zone. */
export function todayKey(now: Date = new Date()): DateKey {
  return makeKey(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Parses a key, returning null for anything that is not a real calendar day. */
export function parseKey(key: string): DateParts | null {
  const match = KEY_PATTERN.exec(key);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (year < MIN_YEAR || year > MAX_YEAR) return null;

  // Round-trip through Date to reject overflow such as 31 February.
  const probe = new Date(Date.UTC(year, month, day));
  const isReal =
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month &&
    probe.getUTCDate() === day;

  return isReal ? { year, month, day } : null;
}

export function isValidKey(key: unknown): key is DateKey {
  return typeof key === "string" && parseKey(key) !== null;
}

function toUtc(key: DateKey): number {
  const parts = parseKey(key);
  return parts ? Date.UTC(parts.year, parts.month, parts.day) : NaN;
}

function fromUtc(time: number): DateKey {
  const date = new Date(time);
  return makeKey(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Whole calendar days from `from` to `to`. Negative when `to` is earlier. */
export function daysBetween(from: DateKey, to: DateKey): number {
  return Math.round((toUtc(to) - toUtc(from)) / MS_PER_DAY);
}

export function addDays(key: DateKey, amount: number): DateKey {
  return fromUtc(toUtc(key) + amount * MS_PER_DAY);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Moves by whole months, clamping the day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(key: DateKey, amount: number): DateKey {
  const parts = parseKey(key);
  if (!parts) return key;

  const index = parts.year * 12 + parts.month + amount;
  const year = Math.floor(index / 12);
  const month = ((index % 12) + 12) % 12;
  return makeKey(year, month, Math.min(parts.day, daysInMonth(year, month)));
}

/** 0 = Sunday … 6 = Saturday */
export function weekdayOf(key: DateKey): number {
  return new Date(toUtc(key)).getUTCDay();
}

/**
 * First day of the week for the user's locale (0 = Sunday … 6 = Saturday).
 * Falls back to Monday where the browser cannot tell us.
 */
export function firstDayOfWeek(): number {
  try {
    const locale = new Intl.Locale(navigator.language) as Intl.Locale & {
      getWeekInfo?: () => { firstDay?: number };
      weekInfo?: { firstDay?: number };
    };
    const firstDay = (locale.getWeekInfo?.() ?? locale.weekInfo)?.firstDay;
    if (typeof firstDay === "number" && firstDay >= 1 && firstDay <= 7) {
      return firstDay % 7; // Intl uses 1 = Monday … 7 = Sunday
    }
  } catch {
    // Older browsers: fall through to the default.
  }
  return 1;
}

/**
 * A fixed six-week grid for one month. Cells outside the month are null, so
 * the calendar keeps the same height whichever month is showing.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  weekStart: number,
): (DateKey | null)[][] {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const leading = (firstWeekday - weekStart + 7) % 7;
  const total = daysInMonth(year, month);

  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - leading + 1;
    return day >= 1 && day <= total ? makeKey(year, month, day) : null;
  });

  return Array.from({ length: 6 }, (_, row) => cells.slice(row * 7, row * 7 + 7));
}

/* ── Formatting ─────────────────────────────────────────────────────────── */

const LOCALE = "en-GB";

const longFormat = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const fullFormat = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "25 December 2026" */
export function formatLong(key: DateKey): string {
  const time = toUtc(key);
  return Number.isNaN(time) ? key : longFormat.format(time);
}

/** "Friday 25 December 2026" */
export function formatFull(key: DateKey): string {
  const time = toUtc(key);
  return Number.isNaN(time) ? key : fullFormat.format(time);
}

export const MONTHS: { long: string; short: string }[] = Array.from({ length: 12 }, (_, month) => {
  const long = new Intl.DateTimeFormat(LOCALE, { month: "long", timeZone: "UTC" }).format(
    Date.UTC(2024, month, 1),
  );
  // Sliced rather than Intl's "short", which mixes lengths in en-GB ("Sept").
  return { long, short: long.slice(0, 3) };
});

/** "25 Dec 2026", for places too narrow for the full month name. */
export function formatShort(key: DateKey): string {
  const parts = parseKey(key);
  return parts ? `${parts.day} ${MONTHS[parts.month].short} ${parts.year}` : key;
}

/** Weekday column headers, rotated to begin on `weekStart`. */
export function weekdayLabels(weekStart: number): { long: string; short: string }[] {
  return Array.from({ length: 7 }, (_, offset) => {
    // 7 January 2024 was a Sunday.
    const time = Date.UTC(2024, 0, 7 + ((weekStart + offset) % 7));
    const long = new Intl.DateTimeFormat(LOCALE, { weekday: "long", timeZone: "UTC" }).format(time);
    return { long, short: long.slice(0, 2) };
  });
}
