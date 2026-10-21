"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import styles from "./charts.module.scss";

export interface SparklineProps {
  values: number[];
  /** One label per value (day, time...). Shown in the tooltip. */
  labels?: string[];
  /** What the numbers are, e.g. "Success rate". */
  name: string;
  unit?: string;
  /** Screen-reader summary; the chart is an image to assistive tech. */
  ariaLabel: string;
  height?: number;
}

/** Single-series trend: 2px line, 10% wash, an end dot with a surface ring, tooltip on hover or arrow keys. */
export function Sparkline({ values, labels, name, unit = "", ariaLabel, height = 48 }: SparklineProps) {
  const data = values.map((v, i) => ({ label: labels?.[i] ?? `Point ${i + 1}`, value: v }));
  const last = data.length - 1;
  return (
    <div className={styles.frame} style={{ height }} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 200, height }}>
        <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 2, left: 6 }} accessibilityLayer={false}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip
            cursor={{ stroke: "var(--color-outline-variant)", strokeWidth: 1 }}
            content={<ChartTooltip rows={(p) => [{ name, value: `${p.value}${unit}` }]} title={(p) => p.label} />}
          />
          <Area
            type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2}
            fill="var(--color-primary)" fillOpacity={0.1} isAnimationActive={false}
            dot={(p: { cx?: number; cy?: number; index?: number }) =>
              p.index === last && p.cx !== undefined && p.cy !== undefined
                ? <circle key="end" cx={p.cx} cy={p.cy} r={4} fill="var(--color-primary)" stroke="var(--color-surface-low)" strokeWidth={2} />
                : <g key={p.index} />}
            activeDot={{ r: 4, fill: "var(--color-primary)", stroke: "var(--color-surface-low)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
