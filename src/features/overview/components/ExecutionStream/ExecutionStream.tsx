"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card/Card";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { cx } from "@/lib/cx";
import { DisabledAction } from "../DisabledAction/DisabledAction";
import type { LogLine } from "../../types";
import styles from "./ExecutionStream.module.scss";

/** Static log excerpt. Log text is untrusted-style content and is rendered only as React text. */
export function ExecutionStream({ logs, footer }: { logs: LogLine[]; footer: string[] }) {
  const [warnOnly, setWarnOnly] = useState(false);
  const shown = warnOnly ? logs.filter((l) => l.level === "warn") : logs;

  return (
    <Card
      title="Execution Stream · stdout / stderr"
      flush
      actions={
        <span className={styles.controls}>
          <StatusBadge tone="neutral" icon="photo_camera">Static excerpt, no live connection</StatusBadge>
          <label className={styles.check}>
            <input type="checkbox" checked={warnOnly} onChange={(e) => setWarnOnly(e.target.checked)} />
            Warnings only
          </label>
          <DisabledAction label="Raw Trace" />
        </span>
      }
    >
      <div className={styles.body} role="log" aria-label="Execution stream excerpt (mock data)" tabIndex={0}>
        {shown.length === 0 && <p className={styles.empty}>No lines match.</p>}
        {shown.map((l) => (
          <p key={l.time} className={cx(styles.line, l.level === "warn" && styles.warn)}>
            <span className={styles.time}>[{l.time}]</span>
            <strong className={styles.source}>{l.source}:</strong>
            <span>{l.message}</span>
          </p>
        ))}
      </div>
      <p className={styles.footer}>{footer.map((f) => <span key={f}>{f}</span>)}</p>
    </Card>
  );
}
