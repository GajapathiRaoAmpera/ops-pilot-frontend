import { cx } from "@/lib/cx";
import { Icon } from "../Icon/Icon";
import styles from "./StatusBadge.module.scss";

export type Tone = "success" | "warning" | "error" | "info" | "accent" | "neutral";

/** Each tone has a default icon, so status is never carried by colour alone. Pass icon="" to omit it. */
const DEFAULT_ICON: Partial<Record<Tone, string>> = {
  success: "check_circle", warning: "warning", error: "error", info: "info", accent: "autorenew",
};

export function StatusBadge({ tone = "neutral", icon, children }: { tone?: Tone; icon?: string; children: string }) {
  const name = icon ?? DEFAULT_ICON[tone];
  return (
    <span className={cx(styles.badge, styles[tone])}>
      {name && <Icon name={name} size={14} />}
      {children}
    </span>
  );
}
