import { useEffect, useRef, type MouseEvent, type ReactNode, type RefObject } from "react";
import { cn } from "../utils/cn";

interface SheetProps {
  /** Ref to the underlying <dialog>. Call `.close()` on it to dismiss. */
  ref: RefObject<HTMLDialogElement | null>;
  /** id of the element that titles the sheet */
  labelledBy: string;
  /** Fires once the sheet has closed, however that happened. */
  onClose: () => void;
  className?: string;
  children: ReactNode;
}

/**
 * Modal surface shared by the app's overlays: a centred panel on larger
 * screens, a bottom sheet on phones.
 *
 * It is a native modal <dialog>, which provides the focus trap, Escape, an
 * inert page behind, and returning focus to whatever opened it. Closing
 * always goes through `dialog.close()` so every route shares one path.
 */
export function Sheet({ ref, labelledBy, onClose, className, children }: SheetProps) {
  const pressBeganOnBackdrop = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, [ref]);

  // A click lands on the <dialog> element itself only when it hits the
  // backdrop. Requiring the press to start there too means dragging a text
  // selection out of an input can't dismiss the sheet.
  const handleMouseDown = (event: MouseEvent<HTMLDialogElement>) => {
    pressBeganOnBackdrop.current = event.target === event.currentTarget;
  };
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget && pressBeganOnBackdrop.current) {
      event.currentTarget.close();
    }
    pressBeganOnBackdrop.current = false;
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={cn(
        "sheet m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-card p-0 text-white shadow-[0_24px_80px_rgb(0_0_0/0.6)] open:flex max-sm:mb-0 max-sm:max-h-[calc(100dvh-0.75rem)] max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0",
        className,
      )}
    >
      {children}
    </dialog>
  );
}
