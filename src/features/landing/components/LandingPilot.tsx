"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { Robot, type RobotMood } from "@/features/auth/components/RobotAgent/Robot";
import { cx } from "@/lib/cx";
import { flightTarget, type Side, type Waypoint } from "../pilot-flight";
import styles from "./LandingPilot.module.scss";

export interface PilotVoice { mood: RobotMood; line: string }

const POKES = ["Hi, I'm Pilot.", "I read failed logs so you don't have to.", "I never run anything without a person's OK."];
const HIDDEN_KEY = "opspilot-landing-pilot-hidden";
const WIDE = "(min-width: 75rem)";
const isWide = () => window.matchMedia?.(WIDE).matches ?? false;
function subscribeWide(cb: () => void) {
  const m = window.matchMedia?.(WIDE);
  m?.addEventListener("change", cb);
  return () => m?.removeEventListener("change", cb);
}
const prefersReduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));

/** The section crossing the middle of the screen, as Pilot's flight plan needs it. */
function reading(vh: number) {
  for (const el of document.querySelectorAll<HTMLElement>("[data-pilot-line]")) {
    const r = el.getBoundingClientRect();
    if (r.top <= vh / 2 && r.bottom >= vh / 2) {
      return { top: r.top, height: r.height, side: (el.dataset.pilotSide === "left" ? "left" : "right") as Side };
    }
  }
  return null;
}

/**
 * One Pilot for the whole landing page. On wide screens it stands beside the hero's pipeline and narrates it; once
 * the hero scrolls away (or on narrower screens) it docks in the corner and follows along. Sections tell it what to
 * say with `data-pilot-line` / `data-pilot-mood`; anything with `data-pilot-say` makes it comment on hover or focus.
 */
export function LandingPilot({ hero, heroId }: { hero: PilotVoice; heroId: string }) {
  const wide = useSyncExternalStore(subscribeWide, isWide, () => true);
  const [inHero, setInHero] = useState(true);
  const [section, setSection] = useState<PilotVoice | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [side, setSide] = useState<Side>("right");
  const boxRef = useRef<HTMLDivElement>(null);
  const heroRect = useRef<DOMRect | null>(null);

  useEffect(() => {
    // Browser-only preference, read after mount so server and client render the same first frame.
    const id = window.setTimeout(() => {
      try { setHidden(sessionStorage.getItem(HIDDEN_KEY) === "1"); } catch { /* not remembered */ }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onOver = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.("[data-pilot-say]");
      setHover(el ? el.getAttribute("data-pilot-say") : null);
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("focusin", onOver);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onOver);
    };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return; // Pilot simply stays with the hero's story
    const heroEl = document.getElementById(heroId);
    const heroIo = new IntersectionObserver(([e]) => setInHero(e.isIntersecting), { threshold: 0.35 });
    if (heroEl) heroIo.observe(heroEl);

    // The section crossing the middle of the screen is the one being read.
    const sectionIo = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        setSection({ mood: (el.dataset.pilotMood as RobotMood | undefined) ?? "idle", line: el.dataset.pilotLine ?? "" });
      }
    }, { rootMargin: "-45% 0px -45% 0px" });
    document.querySelectorAll<HTMLElement>("[data-pilot-line]").forEach((el) => sectionIo.observe(el));
    return () => { heroIo.disconnect(); sectionIo.disconnect(); };
  }, [heroId]);

  const docked = !wide || !inHero;

  // Flight: once docked, Pilot flies (from where it stood in the hero) to a waypoint beside the section being read,
  // following it as the page scrolls, leaning into the direction it moves. Reduced motion: it simply appears there.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (!docked) {
      const track = () => { heroRect.current = el.getBoundingClientRect(); };
      track();
      window.addEventListener("scroll", track, { passive: true });
      return () => window.removeEventListener("scroll", track);
    }
    const still = prefersReduced();
    const box = { w: el.offsetWidth, h: el.offsetHeight };
    let target: Waypoint = flightTarget(window.innerWidth, window.innerHeight, box, reading(window.innerHeight));
    const from = heroRect.current;
    const m = { x: from?.left ?? target.x, y: from?.top ?? target.y, lean: 0, raf: 0, last: 0 };
    const apply = () => { el.style.transform = `translate3d(${m.x}px, ${m.y}px, 0) rotate(${m.lean}deg)`; };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - m.last) / 1000 || 0.016);
      m.last = now;
      const px = m.x;
      m.x = damp(m.x, target.x, 3.2, dt);
      m.y = damp(m.y, target.y, 3.2, dt);
      const vx = (m.x - px) / dt;
      m.lean = damp(m.lean, Math.max(-14, Math.min(14, vx * 0.02)), 8, dt);
      apply();
      const settled = Math.abs(target.x - m.x) < 0.5 && Math.abs(target.y - m.y) < 0.5 && Math.abs(m.lean) < 0.05;
      m.raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const fly = () => {
      const vh = window.innerHeight;
      target = flightTarget(window.innerWidth, vh, { w: el.offsetWidth, h: el.offsetHeight }, reading(vh));
      setSide(target.side);
      if (still) { m.x = target.x; m.y = target.y; apply(); return; }
      if (!m.raf) { m.last = performance.now(); m.raf = requestAnimationFrame(tick); }
    };

    apply();
    const first = requestAnimationFrame(fly);
    window.addEventListener("scroll", fly, { passive: true });
    window.addEventListener("resize", fly);
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(m.raf);
      window.removeEventListener("scroll", fly);
      window.removeEventListener("resize", fly);
      el.style.transform = "";
    };
  }, [docked]);
  const voice: PilotVoice = hover ? { mood: "curious", line: hover } : docked && section && !inHero ? section : hero;

  const setHiddenSaved = (v: boolean) => {
    setHidden(v);
    try { sessionStorage.setItem(HIDDEN_KEY, v ? "1" : "0"); } catch { /* not remembered */ }
  };

  return (
    <>
      <div ref={boxRef} className={cx(styles.pilot, docked ? styles.docked : styles.inHero)} data-hidden={docked && hidden}
        data-side={side}>
        <Robot mood={voice.mood} line={voice.line} pokes={POKES} className={styles.robot} bubbleClassName={styles.bubble} />
        {docked && (
          <button type="button" className={styles.hide} onClick={() => setHiddenSaved(true)} aria-label="Hide Pilot">
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
      {docked && hidden && (
        <button type="button" className={styles.show} onClick={() => setHiddenSaved(false)} aria-label="Show Pilot">
          <Icon name="smart_toy" size={18} />
        </button>
      )}
    </>
  );
}
