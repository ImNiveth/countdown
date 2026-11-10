import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover active:bg-accent-press",
  secondary:
    "border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10 active:bg-white/5",
  ghost: "text-muted hover:bg-white/5 hover:text-white active:bg-white/10",
};

export function Button({ variant = "primary", type = "button", className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 shrink-0 select-none items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors duration-200",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name; icon buttons have no visible text. */
  label: string;
}

export function IconButton({ label, type = "button", className, ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[17px] text-muted transition-colors duration-200 hover:bg-white/10 hover:text-white",
        className,
      )}
      {...props}
    />
  );
}
