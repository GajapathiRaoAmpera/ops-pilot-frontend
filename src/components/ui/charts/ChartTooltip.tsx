import type { ReactNode } from "react";
import styles from "./charts.module.scss";

interface Row { name: string; value: string; color?: string }

/** Shared tooltip body: ink for text, a colour key beside it for identity (text never wears the series colour). */
export function ChartTooltip({ active, payload, rows, title }: {
  active?: boolean;
  payload?: { payload: Record<string, never> & { label: string; value: number } }[];
  rows: (p: { label: string; value: number }) => Row[];
  title: (p: { label: string; value: number }) => ReactNode;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as unknown as { label: string; value: number };
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{title(p)}</p>
      {rows(p).map((r) => (
        <p key={r.name} className={styles.tooltipRow}>
          {r.color && <span className={styles.key} style={{ background: r.color }} aria-hidden="true" />}
          <span>{r.name}</span><strong>{r.value}</strong>
        </p>
      ))}
    </div>
  );
}
