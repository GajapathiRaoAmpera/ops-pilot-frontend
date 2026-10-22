"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { emitActivity } from "@/lib/activity";
import styles from "./Toast.module.scss";

export type ToastTone = "success" | "error" | "info";
export interface ToastInput {
  tone: ToastTone;
  title: string;
  /** Plain-language explanation shown under the title. */
  message?: string;
  /** Technical reference (status code, error code) for troubleshooting; shown small and selectable. */
  reference?: string;
}
interface ToastItem extends ToastInput { id: number }

const ICON: Record<ToastTone, string> = { success: "check_circle", error: "error", info: "info" };
// Errors stay longer: people need time to read and copy the reference.
const LIFETIME: Record<ToastTone, number> = { success: 5000, info: 5000, error: 10000 };
const MAX = 3;

const ToastContext = createContext<{ notify: (t: ToastInput) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/** Transient, non-blocking messages for work that happens in the background. Form errors stay inline. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setItems((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const arm = useCallback((id: number, tone: ToastTone) => {
    clearTimeout(timers.current.get(id));
    timers.current.set(id, setTimeout(() => dismiss(id), LIFETIME[tone]));
  }, [dismiss]);

  const notify = useCallback((t: ToastInput) => {
    emitActivity({ tone: t.tone, title: t.title }); // listeners (Pilot) see real results only, same as the toast
    const id = next.current++;
    setItems((cur) => [...cur.slice(-(MAX - 1)), { ...t, id }]);
    arm(id, t.tone);
  }, [arm]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.region} role="region" aria-label="Notifications">
        {items.map((t) => (
          <div
            key={t.id}
            className={styles.toast}
            data-tone={t.tone}
            role={t.tone === "error" ? "alert" : "status"}
            onMouseEnter={() => clearTimeout(timers.current.get(t.id))}
            onMouseLeave={() => arm(t.id, t.tone)}
            onFocus={() => clearTimeout(timers.current.get(t.id))}
            onBlur={() => arm(t.id, t.tone)}
          >
            <span className={styles.icon}><Icon name={ICON[t.tone]} size={20} /></span>
            <div className={styles.text}>
              <p className={styles.title}>{t.title}</p>
              {t.message && <p className={styles.message}>{t.message}</p>}
              {t.reference && <p className={styles.reference}>Reference: {t.reference}</p>}
            </div>
            <button type="button" className={styles.close} aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
              <Icon name="close" size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
