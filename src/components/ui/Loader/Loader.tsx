import { cx } from "@/lib/cx";
import styles from "./Loader.module.scss";

/** Inline section loader. Announced to assistive tech; keeps its space so the layout does not jump. */
export function Loader({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cx(styles.loader, className)}>
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/** Placeholder rows for table-shaped sections while data loads. */
export function LoaderRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className={styles.rows} role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => <span key={i} className={styles.row} aria-hidden="true" />)}
    </div>
  );
}
