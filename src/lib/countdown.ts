import type { Countdown } from "../types";
import { daysBetween, isValidKey, type DateKey } from "./date";

export const NAME_MAX_LENGTH = 40;

export type CountdownStatus =
  | { kind: "upcoming"; days: number }
  | { kind: "today" }
  | { kind: "passed"; days: number };

export interface CountdownEntry {
  countdown: Countdown;
  status: CountdownStatus;
}

export function getStatus(target: DateKey, today: DateKey): CountdownStatus {
  const difference = daysBetween(today, target);
  if (difference === 0) return { kind: "today" };
  if (difference > 0) return { kind: "upcoming", days: difference };
  return { kind: "passed", days: -difference };
}

/**
 * Nearest upcoming date first (today counts as upcoming). Dates that have
 * passed sink to the end, most recent first.
 */
export function sortCountdowns(countdowns: Countdown[], today: DateKey): CountdownEntry[] {
  return countdowns
    .map((countdown) => ({ countdown, status: getStatus(countdown.date, today) }))
    .sort((a, b) => {
      const aPassed = a.status.kind === "passed";
      const bPassed = b.status.kind === "passed";
      if (aPassed !== bPassed) return aPassed ? 1 : -1;

      if (a.countdown.date !== b.countdown.date) {
        const ascending = a.countdown.date < b.countdown.date ? -1 : 1;
        return aPassed ? -ascending : ascending;
      }

      return (
        a.countdown.createdAt - b.countdown.createdAt ||
        a.countdown.name.localeCompare(b.countdown.name)
      );
    });
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** What a card shows: the dominant figure and the small label beneath it. */
export function cardCopy(status: CountdownStatus): { figure: string; label: string; isWord: boolean } {
  switch (status.kind) {
    case "upcoming":
      return {
        figure: String(status.days),
        label: status.days === 1 ? "Day left" : "Days left",
        isWord: false,
      };
    case "today":
      return { figure: "TODAY!", label: "The day is here", isWord: true };
    case "passed":
      return { figure: "PASSED", label: `${plural(status.days, "day")} ago`, isWord: true };
  }
}

/** One-line description used in the form preview and announcements. */
export function describeStatus(status: CountdownStatus): string {
  switch (status.kind) {
    case "upcoming":
      return `${plural(status.days, "day")} left`;
    case "today":
      return "Today";
    case "passed":
      return `Passed ${plural(status.days, "day")} ago`;
  }
}

/* ── Validation ─────────────────────────────────────────────────────────── */

/** Trims the ends and collapses runs of whitespace. */
export function normaliseName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export interface FormErrors {
  name?: string;
  date?: string;
}

export function validateCountdown(name: string, date: DateKey | null): FormErrors {
  const errors: FormErrors = {};
  const cleaned = normaliseName(name);

  if (cleaned.length === 0) {
    errors.name = "Give this occasion a name.";
  } else if (cleaned.length > NAME_MAX_LENGTH) {
    errors.name = `Keep the name to ${NAME_MAX_LENGTH} characters or fewer.`;
  }

  if (date === null) {
    errors.date = "Pick a date on the calendar.";
  } else if (!isValidKey(date)) {
    errors.date = "That date isn’t valid. Pick another one.";
  }

  return errors;
}
