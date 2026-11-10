/**
 * Grid layout preference: how many countdown cards sit in each row.
 *
 * The person's choice is stored as-is. What is actually shown is that choice
 * clamped to what the current screen can carry, so picking four columns on a
 * laptop never produces unreadable slivers on a phone, and comes back when
 * the window is wide again.
 */

export type Columns = 1 | 2 | 3 | 4;
export type ScreenSize = "phone" | "tablet" | "desktop";

export const COLUMN_OPTIONS: readonly Columns[] = [1, 2, 3, 4];
export const LAYOUT_STORAGE_KEY = "countdowns:layout:v1";

/** Screen-size boundaries. These match Tailwind's `sm` and `lg` breakpoints. */
export const TABLET_UP = "(min-width: 40rem)";
export const DESKTOP_UP = "(min-width: 64rem)";

/** A phone has no room for four readable cards side by side. */
export function maxColumns(screen: ScreenSize): Columns {
  return screen === "phone" ? 3 : 4;
}

/** The layout shown until the person picks one themselves. */
export function defaultColumns(screen: ScreenSize): Columns {
  if (screen === "phone") return 2;
  return screen === "tablet" ? 3 : 4;
}

function isColumns(value: unknown): value is Columns {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

/** Returns null when no layout has been chosen on this device. */
export function loadColumns(): Columns | null {
  try {
    const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (stored === null) return null;
    const parsed: unknown = JSON.parse(stored);
    const columns = (parsed as { columns?: unknown } | null)?.columns;
    return isColumns(columns) ? columns : null;
  } catch {
    return null;
  }
}

export function saveColumns(columns: Columns): void {
  try {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ columns }));
  } catch {
    // Storage unavailable: the choice still applies for this session.
  }
}
