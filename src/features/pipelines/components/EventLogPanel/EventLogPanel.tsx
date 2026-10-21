import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { cx } from "@/lib/cx";
import type { LogLine } from "../../types";
import styles from "./EventLogPanel.module.scss";

/** Static snapshot. Nothing streams; text is rendered as plain React text. */
export function EventLogPanel({ lines }: { lines: LogLine[] }) {
  return (
    <section className={styles.panel} aria-labelledby="events-h">
      <header className={styles.head}>
        <div className={styles.title}>
          <Icon name="terminal" size={18} />
          <h2 id="events-h">DEPLOYMENT EVENT LOGS</h2>
          <StatusBadge tone="neutral">Mock snapshot</StatusBadge>
        </div>
        <span className={styles.tail}>TAIL 50 LINES</span>
      </header>
      <ul className={styles.lines}>
        {lines.map((l) => (
          <li key={l.time} className={cx(styles.line, l.level === "error" && styles.error)}>
            <time className={styles.time}>{l.time}</time> {l.level === "error" && <span className={styles.level}>ERROR </span>}{l.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
