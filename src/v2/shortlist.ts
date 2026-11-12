import { useCallback, useEffect, useState } from "react";

/**
 * Per-visitor shortlist kept in localStorage. Wrapped in try/catch because
 * storage can be unavailable (private mode, embedded contexts) — the
 * shortlist then simply lives for the session.
 */
const KEY = "aangan.v2.shortlist";
const EVT = "aangan:shortlist";
let memory: string[] = [];

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return memory;
  }
}

function write(list: string[]) {
  memory = list;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — memory fallback */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useShortlist() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const cur = read();
    write(cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]);
  }, []);
  const clear = useCallback(() => write([]), []);

  return { items, has: (slug: string) => items.includes(slug), toggle, clear };
}
