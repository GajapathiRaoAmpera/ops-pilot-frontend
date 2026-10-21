import { useId } from "react";
import styles from "./BrandMark.module.scss";

/**
 * OpsPilot mark: a pipeline (node and line) driving forward through a chevron, the pilot's heading.
 * Decorative when shown beside the wordmark; give `label` when it stands alone.
 */
export function BrandMark({ size = 32, label }: { size?: number; label?: string }) {
  const id = useId();
  return (
    <svg
      className={styles.mark} width={size} height={size} viewBox="0 0 32 32"
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id}-g)`} />
      <circle cx="8.5" cy="16" r="2.4" fill="#eef2ff" />
      <path d="M11 16h6.5" stroke="#eef2ff" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M17 9.5 23.5 16 17 22.5" fill="none" stroke="#eef2ff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandWordmark() {
  return <span className={styles.word}>OpsPilot</span>;
}
