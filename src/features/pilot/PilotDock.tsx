"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { Robot, type RobotMood } from "@/features/auth/components/RobotAgent/Robot";
import { onActivity, type ActivityEvent } from "@/lib/activity";
import { onInfoFocus, type InfoFocus } from "@/lib/pilot-attention";
import { useSession } from "@/features/auth/components/SessionProvider";
import { helpFor, tipsFor } from "./page-help";
import { PilotFace } from "./PilotFace";
import styles from "./PilotDock.module.scss";

/** What Pilot says while someone reads an "i" card. Varies so repeated hovers don't feel canned. */
const INFO_LINES = [
  (t: string) => `Reading about ${t}? Good call.`,
  (t: string) => `${t}: open me for more tips on this page.`,
  (t: string) => `I can help with ${t}. Just click me.`,
];

const HIDDEN_KEY = "opspilot-pilot-hidden";
const readHidden = () => { try { return localStorage.getItem(HIDDEN_KEY) === "1"; } catch { return false; } };
const writeHidden = (v: boolean) => { try { localStorage.setItem(HIDDEN_KEY, v ? "1" : "0"); } catch { /* not remembered */ } };

/** Pilot in the corner of every signed-in page: quiet until opened, help for the current page, real activity only. */
export function PilotDock() {
  const pathname = usePathname();
  const session = useSession();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [recent, setRecent] = useState<ActivityEvent[]>([]);
  const [unread, setUnread] = useState(0);
  const [still, setStill] = useState(false);
  // Where the open "i" card is, as an eye direction from the launcher (null when no card is open).
  const [attention, setAttention] = useState<{ x: number; y: number } | null>(null);
  const [saying, setSaying] = useState<string | null>(null);
  const lineIndex = useRef(0);

  useEffect(() => {
    // Browser-only preferences, read after mount so server and client render the same first frame.
    const id = window.setTimeout(() => {
      setHidden(readHidden());
      setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => onActivity((e) => {
    setRecent((r) => [e, ...r].slice(0, 5));
    setUnread((n) => n + 1);
  }), []);

  // An "i" card opened somewhere: look at it and say something; let go a moment after it closes.
  useEffect(() => {
    let timer = 0;
    const off = onInfoFocus((f) => {
      window.clearTimeout(timer);
      if (f) {
        setAttention(gazeToward(f, buttonRef.current));
        setSaying(INFO_LINES[lineIndex.current++ % INFO_LINES.length](f.title));
      } else {
        setAttention(null);
        timer = window.setTimeout(() => setSaying(null), 1500);
      }
    });
    return () => { off(); window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The Copilot page has its own, full-size Pilot.
  if (pathname.startsWith("/copilot")) return null;

  const help = helpFor(pathname);
  const last = recent[0];
  const face = attention ? "curious" : last?.tone === "error" ? "worried" : last?.tone === "success" && unread > 0 ? "happy" : "idle";
  const mood: RobotMood = attention ? "curious" : last?.tone === "error" ? "worried" : last?.tone === "success" ? "success" : "curious";

  function toggle() {
    setOpen((o) => !o);
    setUnread(0);
  }
  function hide() {
    setOpen(false); setHidden(true); writeHidden(true);
  }
  function show() {
    setHidden(false); writeHidden(false);
  }

  if (hidden) {
    return <button type="button" className={styles.tab} onClick={show} aria-label="Show Pilot"><Icon name="smart_toy" size={16} /></button>;
  }

  return (
    <div className={styles.dock}>
      {open && (
        <div ref={panelRef} id={panelId} role="dialog" aria-label="Pilot help" tabIndex={-1} className={styles.panel}>
          <header className={styles.panelHead}>
            <p className={styles.panelTitle}>Pilot · {help.title}</p>
            <div className={styles.headActions}>
              <button type="button" className={styles.textButton} onClick={hide}>Hide Pilot</button>
              <button type="button" className={styles.iconButton} aria-label="Close" onClick={() => { setOpen(false); buttonRef.current?.focus(); }}>
                <Icon name="close" size={18} />
              </button>
            </div>
          </header>
          {!still && <Robot mood={mood} line={open ? saying : null} className={styles.robot} />}
          <ul className={styles.tips}>{tipsFor(help, session?.permissions ?? []).map((t) => <li key={t}>{t}</li>)}</ul>
          <section aria-label="Recent activity" className={styles.recent}>
            <p className={styles.recentTitle}>Recent</p>
            {recent.length === 0 ? <p className={styles.muted}>Nothing yet this visit. Results of syncs, approvals and AI runs show up here.</p> : (
              <ul>{recent.map((e) => (
                <li key={e.at} data-tone={e.tone}>
                  <Icon name={e.tone === "error" ? "error" : e.tone === "success" ? "check_circle" : "info"} size={16} />
                  <span>{e.title}</span>
                  <time dateTime={new Date(e.at).toISOString()}>{new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                </li>
              ))}</ul>
            )}
          </section>
        </div>
      )}
      {saying && !open && <p className={styles.say} aria-hidden="true">{saying}</p>}
      <button ref={buttonRef} type="button" className={styles.launcher} data-still={still} data-attention={attention !== null} onClick={toggle}
        aria-expanded={open} aria-controls={open ? panelId : undefined}
        aria-label={unread > 0 ? `Open Pilot help, ${unread} new` : "Open Pilot help"}>
        <PilotFace mood={face} look={attention ?? undefined} />
        {unread > 0 && <span className={styles.badge} aria-hidden="true">{unread > 9 ? "9+" : unread}</span>}
      </button>
    </div>
  );
}

/** Direction from Pilot's launcher to the point being read, each axis -1..1. */
function gazeToward(f: InfoFocus, from: HTMLElement | null): { x: number; y: number } {
  if (!from) return { x: 0, y: 0 };
  const r = from.getBoundingClientRect();
  const dx = f.x - (r.left + r.width / 2);
  const dy = f.y - (r.top + r.height / 2);
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}
