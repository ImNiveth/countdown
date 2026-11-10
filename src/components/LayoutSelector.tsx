import { useRef, type KeyboardEvent } from "react";
import type { Columns } from "../lib/layout";
import { cn } from "../utils/cn";
import { ColumnsIcon } from "./icons";

interface LayoutSelectorProps {
  /** The layout currently on screen. */
  value: Columns;
  /** Layouts this screen can offer, in ascending order. */
  options: readonly Columns[];
  onChange: (columns: Columns) => void;
}

const describe = (columns: Columns) => (columns === 1 ? "1 card per row" : `${columns} cards per row`);

/**
 * Segmented control for the number of cards per row. Each option is drawn as
 * the layout it produces; a thumb slides to the active one.
 *
 * Behaves as a radio group: one tab stop, arrow keys move the selection.
 */
export function LayoutSelector({ value, options, onChange }: LayoutSelectorProps) {
  const buttons = useRef(new Map<Columns, HTMLButtonElement>());
  const activeIndex = Math.max(0, options.indexOf(value));

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (activeIndex + 1) % options.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (activeIndex - 1 + options.length) % options.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = options.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const next = options[nextIndex];
    onChange(next);
    buttons.current.get(next)?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Cards per row"
      onKeyDown={handleKeyDown}
      className="relative inline-flex shrink-0 rounded-full border border-white/6 bg-card p-1"
    >
      {/* The thumb. Segments are equal width, so it moves by whole widths. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1 top-1 h-8 w-10 rounded-full bg-white/12 transition-transform duration-300 ease-out-quint"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />

      {options.map((option) => {
        const isActive = option === value;

        return (
          <button
            key={option}
            ref={(node) => {
              if (node) buttons.current.set(option, node);
              else buttons.current.delete(option);
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={describe(option)}
            title={describe(option)}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option)}
            className={cn(
              "relative flex h-8 w-10 items-center justify-center rounded-full text-lg transition-colors duration-200",
              isActive ? "text-accent-soft" : "text-faint hover:text-white",
            )}
          >
            <ColumnsIcon count={option} />
          </button>
        );
      })}
    </div>
  );
}
