"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import styles from "./charts.module.scss";

export interface MiniColumnsProps {
  values: number[];
  labels?: string[];
  name: string;
  unit?: string;
  ariaLabel: string;
  height?: number;
}

/** Zero-based columns (never a truncated axis). The latest value is the accent; earlier ones recede. */
export function MiniColumns({ values, labels, name, unit = "", ariaLabel, height = 40 }: MiniColumnsProps) {
  const data = values.map((v, i) => ({ label: labels?.[i] ?? `Sample ${i + 1}`, value: v }));
  return (
    <div className={styles.frame} style={{ height }} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 200, height }}>
        <BarChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 2 }} barCategoryGap={2} accessibilityLayer={false}>
          <YAxis hide domain={[0, "dataMax"]} />
          <Tooltip
            cursor={{ fill: "var(--color-surface-high)", opacity: 0.6 }}
            content={<ChartTooltip rows={(p) => [{ name, value: `${p.value}${unit}` }]} title={(p) => p.label} />}
          />
          <Bar dataKey="value" maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={d.label + i} fill={i === data.length - 1 ? "var(--color-primary)" : "var(--color-control-border)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
