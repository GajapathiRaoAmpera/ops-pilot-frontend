import { cx } from "@/lib/cx";
import styles from "./DiffView.module.scss";

/** Unified diff as plain text (React-escaped), one line per row, with +/- shown as text, not only colour. */
export function DiffView({ diff, label = "Proposed change" }: { diff: string; label?: string }) {
  const lines = diff.replace(/\n$/, "").split("\n");
  return (
    <pre className={styles.diff} aria-label={label} tabIndex={0}>
      {lines.map((ln, i) => {
        const kind = ln.startsWith("+++") || ln.startsWith("---") ? "file" : ln.startsWith("@@") ? "hunk"
          : ln.startsWith("+") ? "add" : ln.startsWith("-") ? "del" : "ctx";
        return <span key={i} className={cx(styles.line, styles[kind])}>{ln || " "}{"\n"}</span>;
      })}
    </pre>
  );
}
