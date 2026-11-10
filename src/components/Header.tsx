import { Button } from "./Button";
import { PlusIcon } from "./icons";

interface HeaderProps {
  onAdd: () => void;
}

export function Header({ onAdd }: HeaderProps) {
  return (
    <header className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div>
        <h1 className="text-[2.5rem] font-semibold leading-none tracking-[-0.04em] sm:text-5xl">
          Countdowns
        </h1>
        <p className="mt-3 text-base text-muted sm:text-lg">Every moment counts.</p>
      </div>

      <Button onClick={onAdd} className="max-sm:h-12 max-sm:w-full">
        <PlusIcon className="text-lg" />
        Add Countdown
      </Button>
    </header>
  );
}
