import { useId } from "react";
import styles from "./BrandMark.module.scss";

/**
 * OpsPilot mark: Pilot's head in a security-blue tile. A helmet with a dark visor and two eyes; the antenna ends
 * in a node, the pipeline step being watched. Same drawing as src/app/icon.svg (the favicon).
 * Decorative beside the wordmark; give `label` when it stands alone.
 */
export function BrandMark({ size = 32, label, className }: { size?: number; label?: string; className?: string }) {
  const id = useId();
  return (
    <svg
      className={className ? `${styles.mark} ${className}` : styles.mark} width={size} height={size} viewBox="0 0 32 32"
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false"
    >
      <MarkArt id={id} />
    </svg>
  );
}

/** The drawing itself, shared by the static and the interactive mark. Eyes sit in a group the live mark moves. */
export function MarkArt({ id, eyesClassName }: { id: string; eyesClassName?: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-tile`} x1="3" y1="1" x2="29" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0ea5e9" />
          <stop offset="0.55" stopColor="#0369a1" />
          <stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id={`${id}-visor`} x1="8" y1="12" x2="24" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0b1b2e" />
          <stop offset="1" stopColor="#040b14" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id}-tile)`} />
      <path d="M16 9.6V6.4" stroke="#e0f2fe" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="5.2" r="1.9" fill="#7dd3fc" stroke="#e0f2fe" strokeWidth="0.8" />
      <rect x="5" y="9.5" width="22" height="16" rx="6.2" fill="#f0f9ff" />
      <rect x="3.6" y="14.6" width="2" height="5.8" rx="1" fill="#bae6fd" />
      <rect x="26.4" y="14.6" width="2" height="5.8" rx="1" fill="#bae6fd" />
      <rect x="8" y="12.5" width="16" height="10" rx="4" fill={`url(#${id}-visor)`} />
      <g className={eyesClassName}>
        <rect className="eye" x="11.2" y="15" width="2.6" height="5" rx="1.3" fill="#7dd3fc" />
        <rect className="eye" x="18.2" y="15" width="2.6" height="5" rx="1.3" fill="#7dd3fc" />
      </g>
    </>
  );
}

export function BrandWordmark() {
  return <span className={styles.word}>OpsPilot</span>;
}
