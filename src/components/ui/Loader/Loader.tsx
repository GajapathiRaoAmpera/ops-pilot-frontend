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

/** Centered loader for table-shaped sections while data loads. */
export function LoaderRows({ label = "Loading…" }: { label?: string; rows?: number }) {
  return <Loader label={label} />;
}
