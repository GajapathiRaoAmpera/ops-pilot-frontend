"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { cx } from "@/lib/cx";
import type { PipelineScene } from "../pipeline-scene";
import type { PilotVoice } from "./LandingPilot";
import { STORY, STORY_LENGTH } from "../story";
import styles from "./PipelineHero.module.scss";

const STAGES = ["checkout", "install", "build", "test", "deploy"];
// Pilot scans the failed test during step 2 ("Pilot reads the log").
const SCAN_STEP = 1;
const SCAN_FROM = STORY[SCAN_STEP].at;
const SCAN_TO = STORY[SCAN_STEP + 1].at;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const REDUCED = "(prefers-reduced-motion: reduce)";
const prefersReduced = () => window.matchMedia?.(REDUCED).matches ?? false;
function subscribeReduced(cb: () => void) {
  const m = window.matchMedia?.(REDUCED);
  m?.addEventListener("change", cb);
  return () => m?.removeEventListener("change", cb);
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

interface Pod { x: number; y: number; r: number }

/**
 * Aims Pilot's scan at the test pod: a cone of light from the robot's visor (when the robot stands beside the
 * pipeline), a sweep line, a target ring, and log data flowing back to Pilot. Also drives the scan readout's
 * progress (--on, --scan). Imperative, called every frame, so it never re-renders React.
 */
function drawScan(t: number, pod: Pod, els: {
  stage: HTMLElement; pilot: HTMLElement | null; beam: SVGGElement | null; hud: HTMLElement | null; still: boolean;
}) {
  const on = clamp01((t - SCAN_FROM) / 0.3) * clamp01((SCAN_TO - t) / 0.3);
  const scan = els.still ? (on > 0 ? 1 : 0) : clamp01((t - SCAN_FROM - 0.2) / 2.5);
  const stage = els.stage.getBoundingClientRect();

  if (els.hud) {
    els.hud.style.setProperty("--on", String(on));
    els.hud.style.setProperty("--scan", String(scan));
    // Above the track, up and to the left of the pod (away from Pilot), clear of the other stages.
    const w = els.hud.offsetWidth, h = els.hud.offsetHeight;
    const x = Math.min(stage.width - w - 8, Math.max(8, pod.x - w + pod.r * 0.5));
    els.hud.style.transform = `translate(${x}px, ${Math.max(4, pod.y - pod.r - h - 34)}px)`;
  }

  const beam = els.beam;
  if (!beam) return;
  const robot = els.pilot?.dataset.docked === "false" ? els.pilot.getBoundingClientRect() : null;
  beam.style.opacity = robot ? String(on * (els.still ? 1 : 0.9 + 0.1 * Math.sin(t * 23))) : "0";
  if (!robot || on <= 0) return;

  // From the visor (the robot looks left while scanning) to the pod, as a cone a little wider than the pod.
  const ex = robot.left - stage.left + robot.width * 0.36, ey = robot.top - stage.top + robot.height * 0.3;
  const dx = pod.x - ex, dy = pod.y - ey, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len, spread = pod.r * 1.3;
  const sweep = els.still ? 0 : Math.sin(t * 5) * spread * 0.85;
  const [cone, line, ring, flow, grad] = ["cone", "line", "ring", "flow", "grad"].map((k) => beam.querySelector<SVGElement>(`[data-k="${k}"]`));
  cone?.setAttribute("points", `${ex},${ey} ${pod.x + nx * spread},${pod.y + ny * spread} ${pod.x - nx * spread},${pod.y - ny * spread}`);
  for (const [el, x2, y2] of [[line, pod.x + nx * sweep, pod.y + ny * sweep], [flow, ex, ey]] as const) {
    el?.setAttribute("x1", String(el === flow ? pod.x : ex)); el?.setAttribute("y1", String(el === flow ? pod.y : ey));
    el?.setAttribute("x2", String(x2)); el?.setAttribute("y2", String(y2));
  }
  flow?.setAttribute("stroke-dashoffset", String(els.still ? 0 : -t * 70));
  ring?.setAttribute("cx", String(pod.x)); ring?.setAttribute("cy", String(pod.y));
  ring?.setAttribute("rx", String(pod.r * 1.35)); ring?.setAttribute("ry", String(pod.r * 0.8));
  ring?.setAttribute("stroke-dashoffset", String(els.still ? 0 : t * 30));
  grad?.setAttribute("x1", String(ex)); grad?.setAttribute("y1", String(ey));
  grad?.setAttribute("x2", String(pod.x)); grad?.setAttribute("y2", String(pod.y));
}

/** The 3D pipeline plus the five-step story it plays. The steps work on their own when WebGL is unavailable.
 * `onPilot` receives what Pilot should say about the story right now; `pilotRef` is the robot, for the scan beam. */
export function PipelineHero({ onPilot, pilotRef }: {
  onPilot?: (voice: PilotVoice) => void;
  pilotRef?: RefObject<HTMLDivElement | null>;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sceneRef = useRef<PipelineScene | null>(null);
  const beamRef = useRef<SVGGElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const reduced = useSyncExternalStore(subscribeReduced, prefersReduced, () => false);

  useEffect(() => {
    let cancelled = false;
    const reducedMotion = prefersReduced();
    let io: IntersectionObserver | null = null;
    const start = async () => {
      if (cancelled || !canvasRef.current) return;
      if (!webglAvailable()) { setUnsupported(true); return; }
      const { createPipelineScene } = await import("../pipeline-scene");
      if (cancelled || !canvasRef.current) return;
      sceneRef.current = createPipelineScene(canvasRef.current, {
        labels: labelRefs.current.filter((l): l is HTMLSpanElement => l !== null),
        onStep: setStep,
        reducedMotion,
        onFrame: (t, pod) => {
          if (!stageRef.current) return;
          drawScan(t, pod, { stage: stageRef.current, pilot: pilotRef?.current ?? null, beam: beamRef.current, hud: hudRef.current, still: reducedMotion });
        },
      });
      io = new IntersectionObserver(([e]) => sceneRef.current?.setVisible(e.isIntersecting));
      if (stageRef.current) io.observe(stageRef.current);
      setReady(true);
    };
    // Wait for idle time, but not forever: a busy animated page may never be idle.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const handle = idle(() => void start(), { timeout: 1500 });
    return () => {
      cancelled = true;
      (window.cancelIdleCallback ?? window.clearTimeout)(handle as number);
      io?.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [pilotRef]);

  const toggle = () => {
    if (playing) sceneRef.current?.pause(); else sceneRef.current?.play();
    setPlaying(!playing);
  };
  const choose = (i: number) => {
    setStep(i);
    sceneRef.current?.seek(i);
  };

  const animating = ready && playing && !reduced;
  // Pilot narrates the step that is playing; pointing at a step makes it look over and offer it.
  const pilotMood = hovered !== null ? "curious" : STORY[step].pilot.mood;
  const pilotLine = hovered !== null ? `Want to see "${STORY[hovered].title}"? Click it.` : STORY[step].pilot.line;
  useEffect(() => { onPilot?.({ mood: pilotMood, line: pilotLine }); }, [onPilot, pilotMood, pilotLine]);
  const duration = (i: number) => ((STORY[i + 1]?.at ?? STORY_LENGTH) - STORY[i].at);

  return (
    <div className={styles.hero}>
      <div ref={stageRef} className={cx(styles.stage, unsupported && styles.flat)} data-ready={ready} aria-hidden="true">
        <canvas ref={canvasRef} className={styles.canvas} />
        <svg className={styles.scanLayer}>
          <defs>
            <linearGradient id="pilot-scan" data-k="grad" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#22d3ee" stopOpacity="0.04" />
              <stop offset="1" stopColor="#22d3ee" stopOpacity="0.32" />
            </linearGradient>
          </defs>
          <g ref={beamRef} style={{ opacity: 0 }}>
            <polygon data-k="cone" fill="url(#pilot-scan)" />
            <line data-k="line" className={styles.scanLine} />
            <line data-k="flow" className={styles.scanFlow} />
            <ellipse data-k="ring" className={styles.scanRing} />
          </g>
        </svg>
        {step === SCAN_STEP && (
          <div ref={hudRef} className={styles.hud} style={ready ? ({ "--on": 0 } as CSSProperties) : undefined}>
            <p className={styles.hudHead}><Icon name="radar" size={16} /><span>Pilot · scanning <code>test</code> job log</span></p>
            <span className={styles.hudBar}><span /></span>
            <p className={cx(styles.hudLine, styles.hudMatch)}><Icon name="warning" size={15} /><span>Match: <code>TypeError</code> in pay.ts:41</span></p>
            <p className={cx(styles.hudLine, styles.hudDone)}><Icon name="check_circle" size={15} /><span>Cause found. Drafting a fix…</span></p>
          </div>
        )}
        {[...STAGES, "pull request", "approval"].map((name, i) => (
          <span key={name} ref={(el) => { labelRefs.current[i] = el; }} className={cx(styles.label, i >= STAGES.length && styles.floating)}
            data-status="idle">
            <span className={styles.dot} />{name}
          </span>
        ))}
      </div>

      <div className={styles.story}>
        <ol className={styles.steps} aria-label="How a failed run gets fixed">
          {STORY.map((s, i) => (
            <li key={s.title}>
              <button type="button" className={cx(styles.step, i === step && styles.current, i < step && styles.done)}
                aria-current={i === step ? "step" : undefined} onClick={() => choose(i)}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)} onBlur={() => setHovered(null)}>
                <span className={styles.num}>{i + 1}</span>
                <span className={styles.stepTitle}>{s.title}</span>
                <span className={styles.track} aria-hidden="true">
                  {i === step && <span key={`${step}-${animating}`} className={cx(styles.fill, animating && styles.run)}
                    style={{ animationDuration: `${duration(i)}s` }} />}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className={styles.detailRow}>
          <p className={styles.detail}><strong className={styles.mobileTitle}>{STORY[step].title}. </strong>{STORY[step].detail}</p>
          {ready && !reduced && (
            <button type="button" className={styles.pause} onClick={toggle} aria-pressed={!playing}
              aria-label={playing ? "Pause the animation" : "Play the animation"}>
              <Icon name={playing ? "pause" : "play_arrow"} size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
