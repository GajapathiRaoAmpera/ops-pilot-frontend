"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Icon } from "@/components/ui/Icon/Icon";
import { Table } from "@/components/ui/Table/Table";
import type { DayBucket } from "../../runs-trend";
import styles from "./RunsTrend.module.scss";

const SERIES = [
  { key: "succeeded", label: "Succeeded", color: "var(--color-success)", icon: "check_circle" },
  { key: "failed", label: "Failed", color: "var(--color-error)", icon: "error" },
  { key: "other", label: "Other", color: "var(--color-control-border)", icon: "pending" },
] as const;

function DayTooltip({ active, payload }: { active?: boolean; payload?: { payload: DayBucket }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.tip}>
      <p className={styles.tipTitle}>{d.day} (UTC)</p>
      {SERIES.map((s) => (
        <p key={s.key} className={styles.tipRow}>
          <span className={styles.key} style={{ background: s.color }} aria-hidden="true" />
          <span>{s.label}</span><strong>{d[s.key]}</strong>
        </p>
      ))}
    </div>
  );
}

/**
 * Runs per day, stacked. Status colours are paired with an icon and a label in the legend and tooltip, and
 * a table view carries the same numbers, so meaning never depends on colour alone.
 */
export function RunsTrendChart({ days }: { days: DayBucket[] }) {
  const totals = SERIES.map((s) => ({ ...s, total: days.reduce((n, d) => n + d[s.key], 0) }));
  const summary = `Runs per day, last ${days.length} days (UTC): ${totals.map((t) => `${t.total} ${t.label.toLowerCase()}`).join(", ")}.`;
  return (
    <div>
      <ul className={styles.legend} aria-label="Legend">
        {totals.map((t) => (
          <li key={t.key} className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: t.color }} aria-hidden="true" />
            <Icon name={t.icon} size={14} />
            <span>{t.label}</span>
            <strong>{t.total}</strong>
          </li>
        ))}
      </ul>
      <div className={styles.plot} role="img" aria-label={summary}>
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 220 }}>
          <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: -12 }} barCategoryGap="30%" accessibilityLayer={false}>
            <CartesianGrid vertical={false} stroke="var(--color-outline-variant)" strokeOpacity={0.5} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} interval="preserveStartEnd" tick={{ fill: "var(--color-outline)", fontSize: 12 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--color-outline)", fontSize: 12 }} width={36} />
            <Tooltip cursor={{ fill: "var(--color-surface-high)", opacity: 0.6 }} content={<DayTooltip />} />
            {SERIES.map((s, i) => (
              <Bar
                key={s.key} dataKey={s.key} stackId="runs" fill={s.color} maxBarSize={24} isAnimationActive={false}
                stroke="var(--color-surface-low)" strokeWidth={2}
                radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className={styles.details}>
        <summary>View as table</summary>
        <Table caption="Runs per day">
          <thead><tr><th scope="col">Day (UTC)</th>{SERIES.map((s) => <th key={s.key} scope="col">{s.label}</th>)}</tr></thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date}><th scope="row">{d.day}</th>{SERIES.map((s) => <td key={s.key}>{d[s.key]}</td>)}</tr>
            ))}
          </tbody>
        </Table>
      </details>
    </div>
  );
}
