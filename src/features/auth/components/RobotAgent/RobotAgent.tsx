"use client";

import { useEffect, useRef, useState } from "react";
import { onLoginMood, type LoginMood } from "../../login-mood";
import type { RobotScene } from "./robot-scene";
import styles from "./RobotAgent.module.scss";

const LINES: Partial<Record<LoginMood, string>> = {
  email: "I'll keep an eye on that email.",
  password: "Not peeking, promise.",
  peek: "Okay… just a tiny peek.",
  thinking: "Checking with the server…",
  error: "Hmm, that didn't work. Check your email and password.",
  success: "Welcome back! Taking you in.",
};
const POKES = [
  "Hi, I'm Pilot. I help your team understand failed pipelines.",
  "Every fix I suggest still needs a human's approval.",
  "Your role decides what you can see after you sign in.",
];

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Decorative 3D helper. Loads Three.js only after the page is idle; absent without WebGL. */
export function RobotAgent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<RobotScene | null>(null);
  const pokes = useRef(0);
  const [ready, setReady] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [line, setLine] = useState<string | null>(null);

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
        onPoke: () => setLine(POKES[pokes.current++ % POKES.length]),
      });
      setReady(true);
    };
    // Never compete with the form for the first paint.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const handle = idle(() => void start());
    return () => {
      cancelled = true;
      (window.cancelIdleCallback ?? window.clearTimeout)(handle as number);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => onLoginMood(({ mood, look }) => {
    sceneRef.current?.setMood(mood, look);
    setLine(LINES[mood] ?? null);
  }), []);

  // Speech fades after a few seconds unless the mood keeps it relevant.
  useEffect(() => {
    if (!line) return;
    const id = window.setTimeout(() => setLine(null), 4500);
    return () => window.clearTimeout(id);
  }, [line]);

  if (unsupported) return null;
  return (
    <div className={styles.stage} data-ready={ready} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      {line && <p key={line} className={styles.bubble}>{line}</p>}
    </div>
  );
}
