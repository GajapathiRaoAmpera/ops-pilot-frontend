import { cx } from "@/lib/cx";
import { Icon } from "../Icon/Icon";
import styles from "./StatusBadge.module.scss";

export type Tone = "success" | "warning" | "error" | "info" | "accent" | "neutral";

/** Status is always conveyed by text (and optional icon), never by color alone. */
export function StatusBadge({ tone = "neutral", icon, children }: { tone?: Tone; icon?: string; children: string }) {
  return (
    <span className={cx(styles.badge, styles[tone])}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}
