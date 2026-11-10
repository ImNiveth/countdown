import { useCallback, useEffect, useMemo, useState } from "react";
import { CardActionsSheet } from "./components/CardActionsSheet";
import { CountdownCard } from "./components/CountdownCard";
import { CountdownDialog } from "./components/CountdownDialog";
import { EmptyState } from "./components/EmptyState";
import { Header } from "./components/Header";
import { LayoutSelector } from "./components/LayoutSelector";
import { UndoToast } from "./components/UndoToast";
import { useCountdowns } from "./hooks/useCountdowns";
import { useGridLayout } from "./hooks/useGridLayout";
import { useToday } from "./hooks/useToday";
import { describeStatus, getStatus, sortCountdowns } from "./lib/countdown";
import { formatFull } from "./lib/date";
import type { Columns } from "./lib/layout";
import type { Countdown, CountdownValues } from "./types";

type DialogState = { mode: "add" } | { mode: "edit"; countdown: Countdown };

/** How long a changed card keeps its accent outline (matches the CSS animation). */
const FRESH_DURATION = 1800;

/**
 * Column count and gutter for each layout. Gutters tighten as cards get
 * smaller, so dense layouts on a phone give their width to the cards, and
 * open up again on larger screens.
 */
const GRID_CLASSES: Record<Columns, string> = {
  1: "grid-cols-1 gap-4 sm:gap-5",
  2: "grid-cols-2 gap-3 sm:gap-5",
  3: "grid-cols-3 gap-2 sm:gap-4 lg:gap-5",
  4: "grid-cols-4 gap-3 lg:gap-5",
};

export default function App() {
  const today = useToday();
  const { countdowns, add, update, remove, restore } = useCountdowns();
  const { columns, options: layoutOptions, setColumns } = useGridLayout();

  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [actionsFor, setActionsFor] = useState<Countdown | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<Countdown | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // Re-sorts whenever the list changes or the calendar day rolls over.
  const entries = useMemo(() => sortCountdowns(countdowns, today), [countdowns, today]);

  useEffect(() => {
    if (!freshId) return;
    const timer = window.setTimeout(() => setFreshId(null), FRESH_DURATION);
    return () => window.clearTimeout(timer);
  }, [freshId]);

  const openAdd = useCallback(() => setDialog({ mode: "add" }), []);
  const openEdit = useCallback((countdown: Countdown) => setDialog({ mode: "edit", countdown }), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const closeActions = useCallback(() => setActionsFor(null), []);

  const handleSubmit = (values: CountdownValues) => {
    const summary = describeStatus(getStatus(values.date, today)).toLowerCase();

    if (dialog?.mode === "edit") {
      update(dialog.countdown.id, values);
      setFreshId(dialog.countdown.id);
      setAnnouncement(`${values.name} updated: ${summary}.`);
    } else {
      const created = add(values);
      setFreshId(created.id);
      setAnnouncement(`${values.name} added: ${summary}.`);
    }
  };

  const handleDelete = useCallback(
    (countdown: Countdown) => {
      remove(countdown.id);
      setDeleted(countdown);
      setAnnouncement(`${countdown.name} deleted. Undo is available.`);
    },
    [remove],
  );

  const handleUndo = useCallback(() => {
    if (!deleted) return;
    restore(deleted);
    setFreshId(deleted.id);
    setAnnouncement(`${deleted.name} restored.`);
    setDeleted(null);
  }, [deleted, restore]);

  const dismissToast = useCallback(() => setDeleted(null), []);

  const hasCountdowns = entries.length > 0;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-10 pt-12 sm:px-8 sm:pt-20 lg:px-10">
      <Header onAdd={openAdd} />

      {hasCountdowns && (
        <div className="mt-8 flex items-center justify-between gap-4 sm:mt-12">
          <p className="text-sm text-muted">
            {entries.length} {entries.length === 1 ? "countdown" : "countdowns"}
          </p>
          <LayoutSelector value={columns} options={layoutOptions} onChange={setColumns} />
        </div>
      )}

      <main className={hasCountdowns ? "mt-4 flex-1 sm:mt-5" : "mt-10 flex-1 sm:mt-14"}>
        {hasCountdowns ? (
          <ul role="list" className={`grid ${GRID_CLASSES[columns]}`}>
            {entries.map(({ countdown, status }) => (
              <CountdownCard
                key={countdown.id}
                countdown={countdown}
                status={status}
                fresh={countdown.id === freshId}
                onEdit={openEdit}
                onDelete={handleDelete}
                onMore={setActionsFor}
              />
            ))}
          </ul>
        ) : (
          <EmptyState onAdd={openAdd} />
        )}
      </main>

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 border-t border-white/6 pt-6 text-xs text-faint">
        <p>
          Today is <time dateTime={today}>{formatFull(today)}</time>
        </p>
        <p>Saved on this device</p>
      </footer>

      {actionsFor && (
        <CardActionsSheet
          key={actionsFor.id}
          countdown={actionsFor}
          status={getStatus(actionsFor.date, today)}
          onEdit={openEdit}
          onDelete={handleDelete}
          onClose={closeActions}
        />
      )}

      {dialog && (
        <CountdownDialog
          key={dialog.mode === "edit" ? dialog.countdown.id : "new"}
          countdown={dialog.mode === "edit" ? dialog.countdown : undefined}
          today={today}
          onSubmit={handleSubmit}
          onClose={closeDialog}
        />
      )}

      {deleted && (
        <UndoToast
          key={deleted.id}
          message={`Deleted “${deleted.name}”`}
          onUndo={handleUndo}
          onDismiss={dismissToast}
        />
      )}

      {/* Speaks changes that sighted users see happen on the grid. */}
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
