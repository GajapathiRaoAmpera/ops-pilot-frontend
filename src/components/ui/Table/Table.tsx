import type { ReactNode } from "react";
import styles from "./Table.module.scss";

/** Responsive table: scrolls horizontally inside its own container on narrow screens. `caption` is read by screen readers only. */
export function Table({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}
