import { Button } from "./Button";
import { HourglassIcon, PlusIcon } from "./icons";

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 px-6 py-20 text-center sm:py-28">
      <div className="flex size-12 items-center justify-center rounded-2xl border border-white/6 bg-card text-xl text-accent-soft">
        <HourglassIcon />
      </div>
      <h2 className="mt-6 text-xl font-semibold tracking-tight">Nothing to count down to yet</h2>
      <p className="mt-2 max-w-xs text-pretty text-sm leading-relaxed text-muted">
        Add a date you’re looking forward to and watch the days fall away.
      </p>
      <Button variant="secondary" onClick={onAdd} className="mt-7">
        <PlusIcon className="text-lg" />
        Add your first countdown
      </Button>
    </div>
  );
}
