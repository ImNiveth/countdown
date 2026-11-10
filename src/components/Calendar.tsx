import {
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from "react";
import {
  MAX_YEAR,
  MIN_YEAR,
  MONTHS,
  addDays,
  addMonths,
  buildMonthGrid,
  firstDayOfWeek,
  formatFull,
  makeKey,
  parseKey,
  weekdayLabels,
  weekdayOf,
  type DateKey,
} from "../lib/date";
import { cn } from "../utils/cn";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "./icons";

export interface CalendarHandle {
  /** Moves keyboard focus onto the calendar's active day. */
  focus: () => void;
}

interface CalendarProps {
  value: DateKey | null;
  onChange: (value: DateKey) => void;
  today: DateKey;
  /** id of the visible label for this field */
  labelledBy: string;
  describedBy?: string;
  invalid?: boolean;
  ref?: Ref<CalendarHandle>;
}

const NAV_BUTTON =
  "inline-flex size-9 items-center justify-center rounded-full text-lg text-muted transition-colors duration-150 hover:bg-white/10 hover:text-white disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted";

export function Calendar({
  value,
  onChange,
  today,
  labelledBy,
  describedBy,
  invalid = false,
  ref,
}: CalendarProps) {
  const initial = parseKey(value ?? today);
  const [view, setView] = useState(() => ({
    year: initial?.year ?? new Date().getFullYear(),
    month: initial?.month ?? new Date().getMonth(),
  }));
  const [mode, setMode] = useState<"days" | "months">("days");
  /** The day that arrow keys last moved to. */
  const [cursor, setCursor] = useState<DateKey>(value ?? today);

  const rootRef = useRef<HTMLDivElement>(null);
  const focusPending = useRef(false);
  const captionId = useId();

  const weekStart = useMemo(() => firstDayOfWeek(), []);
  const weekdays = useMemo(() => weekdayLabels(weekStart), [weekStart]);
  const weeks = useMemo(
    () => buildMonthGrid(view.year, view.month, weekStart),
    [view.year, view.month, weekStart],
  );

  const viewPrefix = makeKey(view.year, view.month, 1).slice(0, 8); // "YYYY-MM-"
  const inView = (key: DateKey | null): key is DateKey => key !== null && key.startsWith(viewPrefix);

  // Exactly one day is in the tab order (roving tabindex).
  const tabbable = inView(cursor)
    ? cursor
    : inView(value)
      ? value
      : inView(today)
        ? today
        : makeKey(view.year, view.month, 1);

  const focusActiveDay = () => {
    rootRef.current?.querySelector<HTMLButtonElement>('[data-date][tabindex="0"]')?.focus();
  };

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (mode === "days") {
        focusActiveDay();
      } else {
        focusPending.current = true;
        setMode("days");
      }
    },
  }));

  // After a keyboard move re-renders the grid, put focus on the new day.
  useEffect(() => {
    if (!focusPending.current || mode !== "days") return;
    focusPending.current = false;
    focusActiveDay();
  });

  const caption = `${MONTHS[view.month].long} ${view.year}`;
  const todayParts = parseKey(today);

  const canGoBack = view.year > MIN_YEAR || (mode === "days" && view.month > 0);
  const canGoForward = view.year < MAX_YEAR || (mode === "days" && view.month < 11);

  const step = (delta: 1 | -1) => {
    setView((current) => {
      const index = current.year * 12 + current.month + (mode === "days" ? delta : delta * 12);
      const year = Math.floor(index / 12);
      if (year < MIN_YEAR || year > MAX_YEAR) return current;
      return { year, month: index % 12 };
    });
  };

  const moveCursor = (next: DateKey) => {
    const parts = parseKey(next); // null outside the supported year range
    if (!parts) return;
    focusPending.current = true;
    setCursor(next);
    setView({ year: parts.year, month: parts.month });
  };

  const selectDay = (key: DateKey) => {
    setCursor(key);
    onChange(key);
  };

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = (event.target as HTMLElement).closest<HTMLElement>("[data-date]")?.dataset.date;
    if (!current) return;

    const column = (weekdayOf(current) - weekStart + 7) % 7;
    let next: DateKey;

    switch (event.key) {
      case "ArrowLeft":
        next = addDays(current, -1);
        break;
      case "ArrowRight":
        next = addDays(current, 1);
        break;
      case "ArrowUp":
        next = addDays(current, -7);
        break;
      case "ArrowDown":
        next = addDays(current, 7);
        break;
      case "Home":
        next = addDays(current, -column);
        break;
      case "End":
        next = addDays(current, 6 - column);
        break;
      case "PageUp":
        next = addMonths(current, event.shiftKey ? -12 : -1);
        break;
      case "PageDown":
        next = addMonths(current, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }

    event.preventDefault();
    moveCursor(next);
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={cn(
        "rounded-2xl border bg-well p-3 transition-colors duration-200",
        invalid ? "border-danger/70" : "border-white/8",
      )}
    >
      <div className="flex items-center justify-between gap-2 pb-1">
        <button
          type="button"
          onClick={() => setMode((current) => (current === "days" ? "months" : "days"))}
          aria-expanded={mode === "months"}
          aria-label={mode === "days" ? `${caption}. Choose month and year` : `Back to ${caption}`}
          className="-ml-0.5 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-white/10"
        >
          <span id={captionId}>{mode === "days" ? caption : view.year}</span>
          <ChevronDownIcon
            className={cn(
              "text-base text-muted transition-transform duration-200",
              mode === "months" && "rotate-180",
            )}
          />
        </button>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={!canGoBack}
            aria-label={mode === "days" ? "Previous month" : "Previous year"}
            className={NAV_BUTTON}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={!canGoForward}
            aria-label={mode === "days" ? "Next month" : "Next year"}
            className={NAV_BUTTON}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Tells screen readers which month the arrows landed on. */}
      <p className="sr-only" aria-live="polite">
        {mode === "days" ? caption : `Months of ${view.year}`}
      </p>

      {mode === "days" ? (
        <div role="grid" aria-labelledby={captionId} onKeyDown={handleGridKeyDown}>
          <div role="row" className="grid grid-cols-7">
            {weekdays.map((weekday) => (
              <div
                key={weekday.long}
                role="columnheader"
                aria-label={weekday.long}
                className="flex h-8 items-center justify-center text-[11px] font-medium uppercase tracking-[0.08em] text-faint"
              >
                {weekday.short}
              </div>
            ))}
          </div>

          {weeks.map((week, row) => (
            <div key={row} role="row" className="grid h-9 grid-cols-7 sm:h-10">
              {week.map((key, column) => {
                if (key === null) return <div key={`empty-${column}`} role="gridcell" />;

                const isSelected = key === value;
                const isToday = key === today;

                return (
                  <div
                    key={key}
                    role="gridcell"
                    aria-selected={isSelected}
                    className="flex items-center justify-center"
                  >
                    <button
                      type="button"
                      data-date={key}
                      tabIndex={key === tabbable ? 0 : -1}
                      aria-label={`${formatFull(key)}${isToday ? ", today" : ""}`}
                      aria-current={isToday ? "date" : undefined}
                      aria-pressed={isSelected}
                      onClick={() => selectDay(key)}
                      className={cn(
                        "relative flex size-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors duration-150 sm:size-10",
                        isToday &&
                          "after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-current sm:after:bottom-1.5",
                        isSelected
                          ? "bg-accent font-semibold text-white"
                          : cn(
                              "hover:bg-white/10",
                              isToday
                                ? "font-semibold text-accent-soft"
                                : key < today
                                  ? "text-muted"
                                  : "text-zinc-100",
                            ),
                      )}
                    >
                      {Number(key.slice(8))}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div
          role="group"
          aria-label={`Months of ${view.year}`}
          className="grid h-62 grid-cols-3 grid-rows-4 gap-1.5 pt-1.5 sm:h-68"
        >
          {MONTHS.map((month, index) => {
            const isViewed = index === view.month;
            const isCurrentMonth = todayParts?.year === view.year && todayParts.month === index;

            return (
              <button
                key={month.long}
                type="button"
                aria-label={`${month.long} ${view.year}`}
                aria-pressed={isViewed}
                onClick={() => {
                  focusPending.current = true;
                  setView({ year: view.year, month: index });
                  setMode("days");
                }}
                className={cn(
                  "rounded-xl text-sm transition-colors duration-150",
                  isViewed
                    ? "bg-accent font-semibold text-white"
                    : cn(
                        "hover:bg-white/10",
                        isCurrentMonth ? "font-semibold text-accent-soft" : "text-zinc-100",
                      ),
                )}
              >
                {month.short}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
