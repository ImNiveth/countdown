import { useCallback, useEffect, useState } from "react";
import { todayKey } from "../lib/date";
import {
  STORAGE_KEY,
  createId,
  createStarterCountdowns,
  loadCountdowns,
  saveCountdowns,
} from "../lib/storage";
import type { Countdown, CountdownValues } from "../types";

/** The countdown list, persisted to localStorage and kept in sync across tabs. */
export function useCountdowns() {
  const [countdowns, setCountdowns] = useState<Countdown[]>(
    () => loadCountdowns() ?? createStarterCountdowns(todayKey()),
  );

  useEffect(() => {
    saveCountdowns(countdowns);
  }, [countdowns]);

  // Another tab changed the list: adopt it. Writing an identical value back
  // does not fire a storage event, so the two tabs cannot ping-pong.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setCountdowns(loadCountdowns() ?? []);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((values: CountdownValues): Countdown => {
    const created: Countdown = { id: createId(), ...values, createdAt: Date.now() };
    setCountdowns((list) => [...list, created]);
    return created;
  }, []);

  const update = useCallback((id: string, values: CountdownValues) => {
    setCountdowns((list) => list.map((item) => (item.id === id ? { ...item, ...values } : item)));
  }, []);

  const remove = useCallback((id: string) => {
    setCountdowns((list) => list.filter((item) => item.id !== id));
  }, []);

  /** Puts a deleted countdown back (used by Undo). */
  const restore = useCallback((countdown: Countdown) => {
    setCountdowns((list) =>
      list.some((item) => item.id === countdown.id) ? list : [...list, countdown],
    );
  }, []);

  return { countdowns, add, update, remove, restore };
}
