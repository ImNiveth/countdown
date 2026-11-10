import { useEffect, useState } from "react";
import { todayKey, type DateKey } from "../lib/date";

/**
 * The current local calendar day, kept fresh for as long as the app is open.
 *
 * A timer fires just after local midnight; the visibility, focus and
 * once-a-minute checks cover laptops that slept through it and clocks or
 * time zones that changed underneath us. Setting the same key is a no-op,
 * so the extra checks never cause a re-render.
 */
export function useToday(): DateKey {
  const [today, setToday] = useState<DateKey>(() => todayKey());

  useEffect(() => {
    let midnightTimer = 0;

    const sync = () => setToday(todayKey());

    const scheduleMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 50);
      midnightTimer = window.setTimeout(() => {
        sync();
        scheduleMidnight();
      }, Math.max(1000, nextMidnight.getTime() - now.getTime()));
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") sync();
    };

    sync();
    scheduleMidnight();
    const minuteTimer = window.setInterval(sync, 60_000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", sync);

    return () => {
      window.clearTimeout(midnightTimer);
      window.clearInterval(minuteTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", sync);
    };
  }, []);

  return today;
}
