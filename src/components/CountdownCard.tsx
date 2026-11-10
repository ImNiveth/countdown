import { useEffect, useId, useRef, type CSSProperties } from "react";
import { cardCopy, type CountdownStatus } from "../lib/countdown";
import { formatLong, formatShort } from "../lib/date";
import type { Countdown } from "../types";
import { cn } from "../utils/cn";
import { IconButton } from "./Button";
import { MoreIcon, PencilIcon, TrashIcon } from "./icons";

interface CountdownCardProps {
  countdown: Countdown;
  status: CountdownStatus;
  /** True for a moment after the card is added, edited or restored. */
  fresh: boolean;
  onEdit: (countdown: Countdown) => void;
  onDelete: (countdown: Countdown) => void;
  /** Opens the combined Edit/Delete sheet, used when the card is compact. */
  onMore: (countdown: Countdown) => void;
}

/**
 * One countdown, as a grid cell.
 *
 * The cell is a size container and the card's proportions are defined in
 * index.css from the cell's width, so the same markup serves every layout.
 * Both action variants are rendered; CSS shows the one that fits.
 */
export function CountdownCard({
  countdown,
  status,
  fresh,
  onEdit,
  onDelete,
  onMore,
}: CountdownCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const copy = cardCopy(status);

  // Sorting can place a new or edited card off-screen; bring it into view.
  useEffect(() => {
    if (!fresh) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cardRef.current?.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }, [fresh]);

  return (
    <li className="card-cell card-enter">
      <article
        ref={cardRef}
        aria-labelledby={titleId}
        data-fresh={fresh || undefined}
        className={cn(
          "countdown-card relative flex h-full flex-col items-center border bg-card text-center transition-colors duration-200 hover:bg-card-hover",
          status.kind === "today"
            ? "border-accent-soft/40 hover:border-accent-soft/60"
            : "border-white/6 hover:border-white/12",
        )}
      >
        <div className="card-actions">
          {/* Roomy cards: one button per action. */}
          <div className="card-actions-full">
            <IconButton label={`Edit ${countdown.name}`} onClick={() => onEdit(countdown)}>
              <PencilIcon />
            </IconButton>
            <IconButton
              label={`Delete ${countdown.name}`}
              onClick={() => onDelete(countdown)}
              className="hover:text-danger"
            >
              <TrashIcon />
            </IconButton>
          </div>

          {/* Compact cards: a single button; its tap area extends past the visible circle. */}
          <div className="card-actions-compact">
            <IconButton
              label={`Edit or delete ${countdown.name}`}
              aria-haspopup="dialog"
              onClick={() => onMore(countdown)}
              className="relative size-7 text-base after:absolute after:-inset-2"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </div>

        <div className="card-stage flex w-full items-end justify-center">
          <p
            className={cn(
              "hero-figure",
              status.kind === "upcoming" && "text-white",
              status.kind === "today" && "text-accent-soft",
              status.kind === "passed" && "text-dim",
            )}
            data-word={copy.isWord || undefined}
            style={{ "--chars": copy.figure.length } as CSSProperties}
          >
            {copy.figure}
          </p>
        </div>

        <p className="card-label font-medium uppercase text-muted">{copy.label}</p>

        <div className="card-foot">
          <h2
            id={titleId}
            title={countdown.name}
            className={cn(
              "card-name line-clamp-2 font-semibold uppercase leading-snug [overflow-wrap:anywhere]",
              status.kind === "passed" ? "text-zinc-300" : "text-white",
            )}
          >
            {countdown.name}
          </h2>
          <p className="card-date text-muted">
            <time dateTime={countdown.date}>
              <span className="card-date-long">{formatLong(countdown.date)}</span>
              <span className="card-date-short">{formatShort(countdown.date)}</span>
            </time>
          </p>
        </div>
      </article>
    </li>
  );
}
