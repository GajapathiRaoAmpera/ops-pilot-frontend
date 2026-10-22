import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import styles from "./EmptyState.module.scss";

/** An empty screen says what is missing and what to do next. Centered in its section. */
export function EmptyState({ title, children, action, icon }: { title: string; children?: ReactNode; action?: ReactNode; icon?: string }) {
  return (
    <div className={styles.empty}>
      {icon && <span className={styles.icon}><Icon name={icon} size={28} /></span>}
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.text}>{children}</p>}
      {action}
    </div>
  );
}
