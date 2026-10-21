import { cx } from "@/lib/cx";
import styles from "./ActionButton.module.scss";

export const NOT_CONNECTED = "Not connected to a backend yet: this action is disabled.";

/** A button for an action that would mutate or execute something. Always disabled until a backend exists. */
export function ActionButton({ label, kind = "neutral" }: { label: string; kind?: "neutral" | "primary" | "danger" }) {
  return (
    <button type="button" disabled title={NOT_CONNECTED} aria-label={`${label} (unavailable: ${NOT_CONNECTED})`} className={cx(styles.btn, styles[kind])}>
      {label}
    </button>
  );
}
