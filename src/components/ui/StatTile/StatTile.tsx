import type { ReactNode } from "react";
import styles from "./StatTile.module.scss";

export function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className={styles.tile}>
      <p className={styles.label}>{label}</p>
      <div className={styles.value}>{value}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  );
}
