import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./DisabledAction.module.scss";

export const NOT_CONNECTED = "Not connected to a backend yet";

/** A button for an action that would mutate or execute something. Always disabled in the mock preview. */
export function DisabledAction({ label, icon, variant = "neutral", className }: {
  label: string;
  icon?: ReactNode;
  variant?: "neutral" | "primary" | "danger";
  className?: string;
}) {
  return (
    <button type="button" disabled title={NOT_CONNECTED} aria-label={`${label} (${NOT_CONNECTED.toLowerCase()})`}
      className={cx(styles.action, styles[variant], className)}>
      {icon}
      {label}
    </button>
  );
}
