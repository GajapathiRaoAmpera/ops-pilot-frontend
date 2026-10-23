import type { CSSProperties } from "react";
import { Sparkle } from "@/components/brand/Sparkle";
import { makeSparkles } from "./sparkles";
import styles from "./AuthBackground.module.scss";

const SPARKLES = makeSparkles();
const TONES = [styles.toneA, styles.toneB, styles.toneC];
// Three depths: nearer layers move further with the pointer, which reads as 3D.
const LAYERS = [0, 1, 2];
const DEPTH = [styles.far, styles.mid, styles.near];

/** Decorative, non-interactive backdrop: drifting light, a faint grid (unless `grid` is false) and twinkling sparkles. */
export function AuthBackground({ grid = true }: { grid?: boolean }) {
  return (
    <div aria-hidden="true" className={styles.backdrop}>
      <div className={`${styles.layer} ${styles.far}`}>
        <div className={`${styles.orb} ${styles.orbA}`} />
        <div className={`${styles.orb} ${styles.orbB}`} />
      </div>
      {grid && <div className={styles.grid} />}
      {LAYERS.map((layer, d) => (
        <div key={d} className={`${styles.layer} ${DEPTH[d]}`}>
          {SPARKLES.filter((_, i) => i % 3 === d).map((s, i) => (
            <span key={i} className={`${styles.sparkle} ${TONES[s.tone]}`}
              style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` } as CSSProperties}>
              <Sparkle size={s.size} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
