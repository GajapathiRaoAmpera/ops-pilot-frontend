import type { ReactNode } from "react";
import styles from "./EmptyState.module.scss";

/** An empty screen says what is missing and what to do next. */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.text}>{children}</p>}
      {action}
    </div>
  );
}
