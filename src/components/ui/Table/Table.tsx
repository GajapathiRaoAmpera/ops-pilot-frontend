import type { ReactNode } from "react";
import styles from "./Table.module.scss";

/** Responsive table: scrolls horizontally inside its own container on narrow screens. `caption` is read by screen readers only. */
export function Table({ caption, tall, children }: { caption: string; tall?: boolean; children: ReactNode }) {
  return (
    <div className={tall ? styles.scrollTall : styles.scroll}>
      <table className={styles.table}>
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}
