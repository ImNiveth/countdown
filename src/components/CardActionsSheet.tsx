import { useEffect, useId, useRef } from "react";
import { describeStatus, type CountdownStatus } from "../lib/countdown";
import { formatLong } from "../lib/date";
import type { Countdown } from "../types";
import { IconButton } from "./Button";
import { Sheet } from "./Sheet";
import { CloseIcon, PencilIcon, TrashIcon } from "./icons";

interface CardActionsSheetProps {
  countdown: Countdown;
  status: CountdownStatus;
  onEdit: (countdown: Countdown) => void;
  onDelete: (countdown: Countdown) => void;
  onClose: () => void;
}

const ACTION =
  "flex h-13 w-full items-center gap-3.5 rounded-2xl px-3 text-left text-base font-medium transition-colors duration-200";

/**
 * Edit and Delete for one countdown, as large touch-friendly rows. Compact
 * cards open this from their single "more" button, because two separate icon
 * buttons would be too small and too close together to tap reliably.
 */
export function CardActionsSheet({
  countdown,
  status,
  onEdit,
  onDelete,
  onClose,
}: CardActionsSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Start on the first action rather than the close button.
  useEffect(() => {
    editRef.current?.focus();
  }, []);

  // Close first, so focus is back on the card before the next step runs.
  const run = (action: (countdown: Countdown) => void) => {
    dialogRef.current?.close();
    action(countdown);
  };

  return (
    <Sheet ref={dialogRef} labelledBy={titleId} onClose={onClose} className="max-w-sm">
      <header className="flex items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-6">
        <div className="min-w-0">
          <h2
            id={titleId}
            className="text-lg font-semibold leading-snug tracking-tight [overflow-wrap:anywhere]"
          >
            {countdown.name}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {formatLong(countdown.date)} · {describeStatus(status)}
          </p>
        </div>
        <IconButton
          label="Close"
          onClick={() => dialogRef.current?.close()}
          className="-mr-2 -mt-1 text-xl"
        >
          <CloseIcon />
        </IconButton>
      </header>

      <div className="flex flex-col gap-1 px-2 pb-3 pt-2 sm:px-3">
        <button
          ref={editRef}
          type="button"
          onClick={() => run(onEdit)}
          className={`${ACTION} text-white hover:bg-white/6 active:bg-white/10`}
        >
          <PencilIcon className="text-xl text-muted" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => run(onDelete)}
          className={`${ACTION} text-danger hover:bg-danger/10 active:bg-danger/15`}
        >
          <TrashIcon className="text-xl" />
          Delete
        </button>
      </div>
    </Sheet>
  );
}
