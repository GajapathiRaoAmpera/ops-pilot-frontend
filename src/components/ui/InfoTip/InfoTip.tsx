"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/cx";
import { emitInfoFocus } from "@/lib/pilot-attention";
import { Icon } from "../Icon/Icon";
import styles from "./InfoTip.module.scss";

const GAP = 8;
const EDGE = 8;

/** Small "i" button that explains a feature in a card on hover, focus or tap. The card renders in a portal with
 * fixed positioning so scrolling containers (the sidebar, cards) never clip it. Escape or leaving closes it. */
export function InfoTip({ title, children, placement = "bottom", className }: {
  title: string;
  children: string;
  placement?: "bottom" | "right";
  className?: string;
}) {
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !button.current || !card.current) return;
    const b = button.current.getBoundingClientRect();
    const c = card.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const clamp = (v: number, max: number) => Math.max(EDGE, Math.min(v, max - EDGE));
    // Right of the trigger when it fits (sidebar); otherwise below it, flipping above near the bottom edge.
    if (placement === "right" && b.right + GAP + c.width <= vw - EDGE) {
      setPos({ left: b.right + GAP, top: clamp(b.top + b.height / 2 - c.height / 2, vh - c.height) });
      return;
    }
    const below = b.bottom + GAP + c.height <= vh - EDGE;
    setPos({
      left: clamp(b.left + b.width / 2 - c.width / 2, vw - c.width),
      top: below ? b.bottom + GAP : Math.max(EDGE, b.top - GAP - c.height),
    });
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  // Pilot listens for these to look at the card and react (decorative only).
  useEffect(() => {
    if (!open || !button.current) return;
    const r = button.current.getBoundingClientRect();
    emitInfoFocus({ title, x: r.left + r.width / 2, y: r.top + r.height / 2 });
    return () => emitInfoFocus(null);
  }, [open, title]);

  const show = () => { setPos(null); setOpen(true); };
  const hide = () => setOpen(false);

  return (
    <>
      <button ref={button} type="button" className={cx(styles.trigger, open && styles.on, className)}
        aria-label={`About ${title}`} aria-expanded={open} aria-describedby={open ? id : undefined}
        onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (open) hide(); else show(); }}>
        <Icon name="info" size={16} />
      </button>
      {open && createPortal(
        <div ref={card} id={id} role="tooltip" className={styles.card}
          style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0, visibility: "hidden" }}>
          <p className={styles.title}>{title}</p>
          <p className={styles.text}>{children}</p>
        </div>,
        document.body,
      )}
    </>
  );
}
