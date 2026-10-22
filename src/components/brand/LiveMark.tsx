"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MarkArt } from "./BrandMark";
import styles from "./BrandMark.module.scss";

/**
 * The OpsPilot mark, alive: eyes follow the pointer, a blink every few seconds, a wink when clicked.
 * `featured` adds an orbiting pipeline node. Decorative (aria-hidden); still for touch and reduced motion.
 */
export function LiveMark({ size = 32, featured = false }: { size?: number; featured?: boolean }) {
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const [wink, setWink] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches !== false) return; // unknown: stay still
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2);
      const dy = y - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / 240); // far away: full glance; close: small
      el.style.setProperty("--ex", `${((dx / dist) * 1.4 * reach).toFixed(2)}px`);
      el.style.setProperty("--ey", `${((dy / dist) * 1.1 * reach).toFixed(2)}px`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    el.dataset.live = "on";
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(frame); };
  }, []);

  return (
    <span ref={ref} className={featured ? `${styles.live} ${styles.featured}` : styles.live} aria-hidden="true"
      style={{ width: size, height: size }} data-wink={wink === 0 ? undefined : wink % 2 ? "a" : "b"}
      onClick={() => setWink((n) => n + 1)}>
      {featured && <span className={styles.orbit}><span className={styles.node} /></span>}
      <svg className={styles.mark} width={size} height={size} viewBox="0 0 32 32" focusable="false">
        <MarkArt id={id} eyesClassName={styles.eyes} />
      </svg>
    </span>
  );
}
