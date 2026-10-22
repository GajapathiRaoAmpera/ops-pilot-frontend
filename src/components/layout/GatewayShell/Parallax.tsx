"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Mouse-driven depth for the sign-in frame. Writes CSS variables only (no React state, no re-renders):
 *   on the root:            --px, --py   pointer position in the viewport, -1..1
 *   on each [data-tilt]:    --rx, --ry   tilt in degrees, --lx, --ly spotlight position in %
 * Off for touch-only devices and for people who prefer reduced motion.
 */
export function Parallax({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      const w = window.innerWidth;
      const h = window.innerHeight;
      root.style.setProperty("--px", ((x / w) * 2 - 1).toFixed(3));
      root.style.setProperty("--py", ((y / h) * 2 - 1).toFixed(3));
      root.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const max = Number(el.dataset.tilt) || 4;
        // Flat while someone is typing in it: a moving form is hard to use.
        const strength = el.matches(":focus-within") ? 0 : 1;
        const nx = Math.max(-1, Math.min(1, (x - (r.left + r.width / 2)) / (r.width / 2 + 200)));
        const ny = Math.max(-1, Math.min(1, (y - (r.top + r.height / 2)) / (r.height / 2 + 200)));
        el.style.setProperty("--ry", `${(nx * max * strength).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-ny * max * strength).toFixed(2)}deg`);
        el.style.setProperty("--lx", `${(((x - r.left) / r.width) * 100).toFixed(1)}%`);
        el.style.setProperty("--ly", `${(((y - r.top) / r.height) * 100).toFixed(1)}%`);
      });
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      x = window.innerWidth / 2;
      y = window.innerHeight / 2;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    root.dataset.parallax = "on";
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onLeave);
      delete root.dataset.parallax;
    };
  }, []);

  return <div ref={ref} className={className}>{children}</div>;
}
