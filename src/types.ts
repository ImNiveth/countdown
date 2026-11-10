import type { DateKey } from "./lib/date";

export interface Countdown {
  id: string;
  name: string;
  date: DateKey;
  /** Epoch milliseconds; used only as a stable tie-breaker when sorting. */
  createdAt: number;
}

/** The fields a person actually edits. */
export interface CountdownValues {
  name: string;
  date: DateKey;
}
