"use client";

import { useEffect, useRef } from "react";
import { AuthBackground } from "@/components/layout/AuthBackground/AuthBackground";
import styles from "./SpaceBackdrop.module.scss";

/** Sections that set the sky's colour as they cross the middle of the screen (indigo, violet, cyan). */
const SKIES = ["hero-scene", "guardrails", "roles"];
const STAR_COLORS = ["#c7d2fe", "#a78bfa", "#67e8f9", "#f8fafc"];
const STARS = 150;
const LINK = 120; // px: how close two stars must be to link up near the pointer
const REACH = 190; // px: how far from the pointer the network wakes up

interface Star { x: number; y: number; z: number; color: string; phase: number }

/** A small seeded random, so the sky is the same on every visit. */
function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/**
 * The landing page's sky, fixed behind everything: the sign-in page's backdrop (orbs, grid, sparkles, moved by
 * Parallax) plus an "agent network" canvas. Stars drift in three depths; near the pointer they link up into
 * constellations with the pointer as one more node; scrolling fast stretches them into streaks; now and then a
 * signal crosses the sky. The nebula takes its colour from the section being read. Decorative only.
 */
export function SpaceBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !root || !ctx) return;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const fine = window.matchMedia?.("(pointer: fine)").matches ?? false;

    const rand = rng(42);
    const stars: Star[] = Array.from({ length: STARS }, () => ({
      x: rand(), y: rand(), z: [0.35, 0.65, 1][Math.floor(rand() * 3)], color: STAR_COLORS[Math.floor(rand() * 4)], phase: rand() * 6.28,
    }));
    let w = 0, h = 0, dpr = 1;
    const pointer = { x: -9999, y: -9999, sx: 0, sy: 0 };
    let lastScroll = window.scrollY, velocity = 0, drift = 0;
    let comet = { at: -4, gap: 6, x: 0, y: 0, dx: 0, dy: 0 };
    let raf = 0, last = 0, clock = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Which section's sky to show: the one crossing the middle of the screen (the hero's until the next one).
    const pickSky = () => {
      let sky = 0;
      SKIES.forEach((id, i) => {
        const r = document.getElementById(id)?.getBoundingClientRect();
        if (r && r.top < h * 0.55) sky = i;
      });
      root.dataset.sky = String(sky);
    };

    const place = (s: Star) => {
      // Pointer parallax (nearer stars move more) and endless vertical scroll with the page.
      let x = (s.x + drift * s.z * 0.004) % 1 * w + pointer.sx * s.z * -24;
      let y = (s.y * h - (window.scrollY * s.z * 0.12)) % h;
      if (y < 0) y += h;
      if (x < 0) x += w;
      return { x, y };
    };

    const draw = (dt: number) => {
      clock += dt;
      ctx.clearRect(0, 0, w, h);
      const warp = Math.min(60, Math.abs(velocity));
      const dir = Math.sign(velocity);
      const pts = stars.map(place);

      // Stars, stretched into streaks while the page scrolls fast.
      stars.forEach((s, i) => {
        const p = pts[i];
        const twinkle = still ? 0.7 : 0.55 + 0.45 * Math.sin(clock * (0.8 + s.z) + s.phase);
        ctx.globalAlpha = (0.25 + 0.55 * s.z) * twinkle;
        ctx.strokeStyle = ctx.fillStyle = s.color;
        const streak = warp * s.z * 0.9;
        if (streak > 2) {
          ctx.lineWidth = 0.6 + s.z;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + streak * dir); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, 0.5 + s.z * 1.1, 0, Math.PI * 2); ctx.fill();
        }
      });

      // The agent network: stars near the pointer link to each other and to the pointer.
      if (fine && !still && pointer.x > -9000) {
        const near = pts.map((p, i) => ({ p, i, d: Math.hypot(p.x - pointer.x, p.y - pointer.y) })).filter((n) => n.d < REACH);
        ctx.lineWidth = 0.8;
        for (let a = 0; a < near.length; a++) {
          const A = near[a];
          const wake = 1 - A.d / REACH;
          if (a < 4 || A.d < REACH * 0.45) {
            ctx.globalAlpha = 0.35 * wake;
            ctx.strokeStyle = "#67e8f9";
            ctx.beginPath(); ctx.moveTo(pointer.x, pointer.y); ctx.lineTo(A.p.x, A.p.y); ctx.stroke();
          }
          for (let b = a + 1; b < near.length; b++) {
            const B = near[b];
            const d = Math.hypot(A.p.x - B.p.x, A.p.y - B.p.y);
            if (d > LINK) continue;
            ctx.globalAlpha = 0.4 * wake * (1 - B.d / REACH) * (1 - d / LINK);
            ctx.strokeStyle = "#a5b4fc";
            ctx.beginPath(); ctx.moveTo(A.p.x, A.p.y); ctx.lineTo(B.p.x, B.p.y); ctx.stroke();
            // A signal travelling along the link.
            const k = (clock * 0.6 + (A.i + B.i) * 0.37) % 1;
            ctx.globalAlpha = 0.9 * wake;
            ctx.fillStyle = "#e0f2fe";
            ctx.beginPath(); ctx.arc(A.p.x + (B.p.x - A.p.x) * k, A.p.y + (B.p.y - A.p.y) * k, 1.3, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "#67e8f9";
        ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 2, 0, Math.PI * 2); ctx.fill();
      }

      // Now and then a signal (a comet) crosses the sky.
      if (!still) {
        if (clock - comet.at > comet.gap) {
          const fromLeft = rand() > 0.5;
          comet = { at: clock, gap: 7 + rand() * 6, x: fromLeft ? -40 : w + 40, y: rand() * h * 0.5, dx: (fromLeft ? 1 : -1) * (w * 0.55), dy: h * 0.22 };
        }
        const k = (clock - comet.at) / 1.6;
        if (k >= 0 && k <= 1) {
          const x = comet.x + comet.dx * k, y = comet.y + comet.dy * k;
          const g = ctx.createLinearGradient(x, y, x - comet.dx * 0.12, y - comet.dy * 0.12);
          g.addColorStop(0, "rgba(224,242,254,0.9)");
          g.addColorStop(1, "rgba(103,232,249,0)");
          ctx.globalAlpha = Math.sin(k * Math.PI);
          ctx.strokeStyle = g; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - comet.dx * 0.12, y - comet.dy * 0.12); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      drift += dt;
      const sc = window.scrollY;
      velocity += ((sc - lastScroll) - velocity) * 0.2; // smoothed px per frame
      lastScroll = sc;
      pointer.sx += ((pointer.x > -9000 ? pointer.x / w * 2 - 1 : 0) - pointer.sx) * 0.06;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && !still) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const onMove = (e: PointerEvent) => { pointer.x = e.clientX; pointer.y = e.clientY; };
    const onLeave = () => { pointer.x = pointer.y = -9999; };
    const onScroll = () => { pickSky(); if (still) draw(0); };
    const onResize = () => { resize(); pickSky(); if (still) draw(0); };
    const onVisibility = () => { if (document.hidden) stop(); else start(); };

    resize();
    pickSky();
    draw(0);
    start();
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.sky} data-sky="0" aria-hidden="true">
      <div className={styles.nebula}><i /><i /><i /></div>
      <div className={styles.sparkles}><AuthBackground grid={false} /></div>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
