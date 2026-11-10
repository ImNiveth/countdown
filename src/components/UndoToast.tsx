import { useEffect, useState } from "react";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  /** How long the toast stays before it leaves on its own. */
  duration?: number;
}

/**
 * Confirms a deletion and offers a way back. The timer pauses while the toast
 * is hovered or focused, and Ctrl/Cmd+Z works as a shortcut for Undo.
 */
export function UndoToast({ message, onUndo, onDismiss, duration = 7000 }: UndoToastProps) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [paused, duration, onDismiss]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.key.toLowerCase() !== "z") return;

      // Leave the shortcut alone while someone is typing.
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }

      event.preventDefault();
      onUndo();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onUndo]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-5 sm:pb-8">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="toast pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-[#232327] py-1.5 pl-5 pr-1.5 text-sm text-white shadow-[0_12px_40px_rgb(0_0_0/0.55)]"
      >
        <p className="min-w-0 truncate">{message}</p>
        <button
          type="button"
          onClick={onUndo}
          className="h-9 shrink-0 rounded-full px-3.5 font-medium text-accent-soft transition-colors duration-200 hover:bg-white/10"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
