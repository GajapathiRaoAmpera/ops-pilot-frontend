import styles from "./PilotDock.module.scss";

/** Pilot's face as flat SVG: used for the corner button (no WebGL needed for the closed state). */
export function PilotFace({ mood }: { mood: "idle" | "happy" | "worried" }) {
  const eye = mood === "worried" ? "var(--color-warning)" : mood === "happy" ? "var(--color-success)" : "var(--color-primary)";
  return (
    <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true" focusable="false">
      <line x1="24" y1="3" x2="24" y2="9" stroke="var(--color-primary-container)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="3.5" r="2.5" fill={eye} />
      <rect x="6" y="9" width="36" height="28" rx="10" fill="#e6eef8" />
      <rect x="10" y="14" width="28" height="17" rx="6" fill="#07121f" />
      <g className={styles.eyes}>
        <rect x="15.5" y="18" width="4" height={mood === "happy" ? 5 : 9} rx="2" fill={eye} />
        <rect x="28.5" y="18" width="4" height={mood === "happy" ? 5 : 9} rx="2" fill={eye} />
      </g>
      <rect x="3" y="18" width="4" height="10" rx="2" fill="var(--color-primary-container)" />
      <rect x="41" y="18" width="4" height="10" rx="2" fill="var(--color-primary-container)" />
    </svg>
  );
}
