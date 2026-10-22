"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { cx } from "@/lib/cx";
import type { PipelineScene } from "../pipeline-scene";
import type { PilotVoice } from "./LandingPilot";
import { STORY, STORY_LENGTH } from "../story";
import styles from "./PipelineHero.module.scss";

const STAGES = ["checkout", "install", "build", "test", "deploy"];

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

/** The 3D pipeline plus the five-step story it plays. The steps work on their own when WebGL is unavailable.
 * `onPilot` receives what Pilot should say about the story right now. */
export function PipelineHero({ onPilot }: { onPilot?: (voice: PilotVoice) => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sceneRef = useRef<PipelineScene | null>(null);
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
      });
      io = new IntersectionObserver(([e]) => sceneRef.current?.setVisible(e.isIntersecting));
      if (stageRef.current) io.observe(stageRef.current);
      setReady(true);
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const handle = idle(() => void start());
    return () => {
      cancelled = true;
      (window.cancelIdleCallback ?? window.clearTimeout)(handle as number);
      io?.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

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
