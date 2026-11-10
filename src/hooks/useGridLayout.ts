import { useCallback, useEffect, useMemo, useState } from "react";
import {
  COLUMN_OPTIONS,
  DESKTOP_UP,
  LAYOUT_STORAGE_KEY,
  TABLET_UP,
  defaultColumns,
  loadColumns,
  maxColumns,
  saveColumns,
  type Columns,
  type ScreenSize,
} from "../lib/layout";
import { useMediaQuery } from "./useMediaQuery";

/**
 * The grid layout to show right now, the layouts this screen can offer, and a
 * setter that remembers the choice on this device.
 */
export function useGridLayout() {
  const [preferred, setPreferred] = useState<Columns | null>(() => loadColumns());

  const tabletUp = useMediaQuery(TABLET_UP);
  const desktopUp = useMediaQuery(DESKTOP_UP);
  const screen: ScreenSize = desktopUp ? "desktop" : tabletUp ? "tablet" : "phone";

  // Follow a change made in another tab.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LAYOUT_STORAGE_KEY) setPreferred(loadColumns());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const limit = maxColumns(screen);
  const columns = Math.min(preferred ?? defaultColumns(screen), limit) as Columns;
  const options = useMemo(() => COLUMN_OPTIONS.filter((option) => option <= limit), [limit]);

  const setColumns = useCallback((next: Columns) => {
    setPreferred(next);
    saveColumns(next);
  }, []);

  return { columns, options, setColumns };
}
