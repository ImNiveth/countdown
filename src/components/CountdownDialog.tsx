import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  NAME_MAX_LENGTH,
  describeStatus,
  getStatus,
  normaliseName,
  validateCountdown,
  type FormErrors,
} from "../lib/countdown";
import { formatFull, type DateKey } from "../lib/date";
import type { Countdown, CountdownValues } from "../types";
import { cn } from "../utils/cn";
import { Button, IconButton } from "./Button";
import { Calendar, type CalendarHandle } from "./Calendar";
import { Sheet } from "./Sheet";
import { CloseIcon } from "./icons";

interface CountdownDialogProps {
  /** The countdown being edited; omit to create a new one. */
  countdown?: Countdown;
  today: DateKey;
  onSubmit: (values: CountdownValues) => void;
  onClose: () => void;
}

export function CountdownDialog({ countdown, today, onSubmit, onClose }: CountdownDialogProps) {
  const isEditing = countdown !== undefined;

  const [name, setName] = useState(countdown?.name ?? "");
  const [date, setDate] = useState<DateKey | null>(countdown?.date ?? null);
  const [errors, setErrors] = useState<FormErrors>({});

  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<CalendarHandle>(null);

  const id = useId();
  const titleId = `${id}-title`;
  const nameId = `${id}-name`;
  const nameErrorId = `${id}-name-error`;
  const dateLabelId = `${id}-date-label`;
  const dateSummaryId = `${id}-date-summary`;

  // With a keyboard at hand, start in the name field. On touch screens, wait
  // for a tap so the on-screen keyboard doesn't cover the calendar. (The
  // Sheet's own effect has already opened the dialog by the time this runs.)
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) nameRef.current?.focus();
  }, []);

  const close = () => dialogRef.current?.close();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateCountdown(name, date);
    setErrors(nextErrors);

    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.date || date === null) {
      calendarRef.current?.focus();
      return;
    }

    onSubmit({ name: normaliseName(name), date });
    close();
  };

  const status = date ? getStatus(date, today) : null;
  const remaining = NAME_MAX_LENGTH - name.length;

  return (
    <Sheet ref={dialogRef} labelledBy={titleId} onClose={onClose} className="max-w-108">
      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 px-5 pb-3 pt-5 sm:px-6">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            {isEditing ? "Edit countdown" : "New countdown"}
          </h2>
          <IconButton label="Close" onClick={close} className="-mr-2 text-xl">
            <CloseIcon />
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-5 pt-1 sm:px-6">
          {/* Occasion */}
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={nameId} className="text-sm font-medium text-zinc-200">
                Occasion
              </label>
              {remaining <= 10 && (
                <span className="text-xs tabular-nums text-faint" aria-hidden="true">
                  {name.length}/{NAME_MAX_LENGTH}
                </span>
              )}
            </div>
            <input
              ref={nameRef}
              id={nameId}
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
              }}
              maxLength={NAME_MAX_LENGTH}
              placeholder="Birthday, vacation, exams…"
              autoComplete="off"
              enterKeyHint="done"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? nameErrorId : undefined}
              className={cn(
                "mt-2 h-12 w-full rounded-xl border bg-well px-4 text-base text-white outline-hidden transition-[border-color,box-shadow] duration-200 placeholder:text-faint",
                errors.name
                  ? "border-danger/70 focus:shadow-[0_0_0_3px_rgb(248_113_113/0.18)]"
                  : "border-white/8 hover:border-white/20 focus:border-accent-soft focus:shadow-[0_0_0_3px_rgb(123_147_255/0.2)]",
              )}
            />
            {/* Read out when focus moves to the field, via aria-describedby. */}
            {errors.name && (
              <p id={nameErrorId} className="mt-2 text-sm text-danger">
                {errors.name}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <p id={dateLabelId} className="text-sm font-medium text-zinc-200">
              Date
            </p>
            <div className="mt-2">
              <Calendar
                ref={calendarRef}
                value={date}
                onChange={(next) => {
                  setDate(next);
                  if (errors.date) setErrors((current) => ({ ...current, date: undefined }));
                }}
                today={today}
                labelledBy={dateLabelId}
                describedBy={dateSummaryId}
                invalid={Boolean(errors.date)}
              />
            </div>

            {/* Live preview of what the card will say. */}
            <div
              id={dateSummaryId}
              aria-live="polite"
              className="mt-3 flex min-h-5 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm"
            >
              {errors.date ? (
                <p className="text-danger">{errors.date}</p>
              ) : date && status ? (
                <>
                  <p className="text-white">{formatFull(date)}</p>
                  <p className={status.kind === "passed" ? "text-muted" : "font-medium text-accent-soft"}>
                    {describeStatus(status)}
                  </p>
                </>
              ) : (
                <p className="text-faint">No date selected yet</p>
              )}
            </div>
          </div>
        </div>

        <footer className="flex items-center gap-3 border-t border-white/6 px-5 py-4 sm:justify-end sm:px-6">
          <Button variant="ghost" onClick={close} className="max-sm:flex-1">
            Cancel
          </Button>
          <Button type="submit" className="max-sm:flex-1">
            {isEditing ? "Save changes" : "Add countdown"}
          </Button>
        </footer>
      </form>
    </Sheet>
  );
}
