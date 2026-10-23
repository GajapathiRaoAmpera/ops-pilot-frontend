"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import type { RobotMood, RobotScene } from "./robot-scene";
import styles from "./RobotAgent.module.scss";

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

interface Props {
  mood: RobotMood;
  look?: number;
  /** Speech bubble text; null hides it. It fades after a few seconds. */
  line: string | null;
  /** Lines for clicks on the robot, in order. */
  pokes?: readonly string[];
  className?: string;
  bubbleClassName?: string;
}

/** Pilot, the decorative 3D robot. Loads Three.js only after the page is idle; absent without WebGL. */
export function Robot({ mood, look, line, pokes = [], className, bubbleClassName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<RobotScene | null>(null);
  const pokeIndex = useRef(0);
  const pokesRef = useRef(pokes);
  const [ready, setReady] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  // A click's line shows until the next real line arrives; the bubble fades out by itself (CSS).
  const [poke, setPoke] = useState<{ text: string; at: number; forLine: string | null } | null>(null);
  const lineRef = useRef(line);

  useEffect(() => { pokesRef.current = pokes; lineRef.current = line; }, [pokes, line]);

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      if (!canvasRef.current || cancelled) return;
      if (!webglAvailable()) { setUnsupported(true); return; }
      const { createRobotScene } = await import("./robot-scene");
      if (cancelled || !canvasRef.current) return;
      sceneRef.current = createRobotScene(canvasRef.current, {
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        onHover: () => {},
        onPoke: () => {
          const list = pokesRef.current;
          if (list.length) setPoke({ text: list[pokeIndex.current++ % list.length], at: Date.now(), forLine: lineRef.current });
        },
      });
      setReady(true);
    };
    // Never compete with the page for the first paint.
    // Wait for idle time, but not forever: a busy animated page may never be idle.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const handle = idle(() => void start(), { timeout: 1500 });
    return () => {
      cancelled = true;
      (window.cancelIdleCallback ?? window.clearTimeout)(handle as number);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => { sceneRef.current?.setMood(mood, look); }, [mood, look, ready]);
  const pokeNow = poke && poke.forLine === line ? poke : null;
  const text = pokeNow?.text ?? line;
  const bubbleKey = pokeNow ? `poke-${pokeNow.at}` : `line-${line}`;

  if (unsupported) return null;
  return (
    <div className={cx(styles.stage, className)} data-ready={ready} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      {text && <p key={bubbleKey} className={cx(styles.bubble, bubbleClassName)}>{text}</p>}
    </div>
  );
}

export type { RobotMood };
