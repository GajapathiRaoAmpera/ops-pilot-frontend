"use client";

import { useEffect, useSyncExternalStore } from "react";
import styles from "./PalettePreview.module.scss";

const NAMES = [
  { id: "indigo", label: "Slate + indigo" },
  { id: "ocean", label: "Security blue" },
  { id: "violet", label: "Deep violet" },
] as const;
const KEY = "opspilot-palette";
const EVENT = "opspilot-palette-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
const current = () => document.documentElement.dataset.palette ?? "indigo";

/** Development-only: flip palettes on the real screens to compare them. Not rendered in production builds. */
export function PalettePreview() {
  const palette = useSyncExternalStore(subscribe, current, () => "indigo");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && NAMES.some((n) => n.id === saved)) {
        document.documentElement.dataset.palette = saved;
        window.dispatchEvent(new Event(EVENT));
      }
    } catch {
      /* storage unavailable: keep the default */
    }
  }, []);

  if (process.env.NODE_ENV === "production") return null;

  function choose(id: string) {
    document.documentElement.dataset.palette = id;
    try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <label className={styles.box}>
      Preview palette
      <select className={styles.select} value={palette} onChange={(e) => choose(e.target.value)}>
        {NAMES.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
      </select>
    </label>
  );
}
