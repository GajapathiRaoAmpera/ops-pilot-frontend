"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card/Card";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { Table } from "@/components/ui/Table/Table";
import { cx } from "@/lib/cx";
import { DisabledAction } from "../DisabledAction/DisabledAction";
import { HEALTH_TONE, type PipelineHealth, type PipelineRow } from "../../types";
import styles from "./PipelineFabric.module.scss";

type Filter = "all" | PipelineHealth;
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" }, { id: "stable", label: "Stable" }, { id: "verifying", label: "Verifying" }, { id: "degraded", label: "Degraded" },
];

export function PipelineFabric({ rows }: { rows: PipelineRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = useMemo(() => rows.filter((r) => filter === "all" || r.health === filter), [rows, filter]);

  return (
    <Card title="Active CI/CD & Deployment Fabric" flush actions={<StatusBadge tone="neutral" icon="photo_camera">Mock snapshot, not auto-syncing</StatusBadge>}>
      <div role="group" aria-label="Filter pipelines by health" className={styles.filters}>
        {FILTERS.map((f) => (
          <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={styles.filter}>
            {f.label}
          </button>
        ))}
      </div>
      <Table caption="Pipelines and services (mock data)">
        <thead>
          <tr><th scope="col">Pipeline / Service</th><th scope="col">Commit / Target</th><th scope="col">Stage Progress</th><th scope="col">Health</th><th scope="col">Actions</th></tr>
        </thead>
        <tbody>
          {visible.length === 0 && <tr><td colSpan={5}>No pipelines match this filter.</td></tr>}
          {visible.map((r) => (
            <tr key={r.id} className={cx(r.health === "degraded" && styles.alert)}>
              <td><span className={styles.mono}>{r.service}</span> <code className={styles.version}>{r.version}</code></td>
              <td><span className={styles.mono}>{r.commit}</span><br /><span className={styles.muted}>{r.target}</span></td>
              <td className={styles.stage}>
                <span className={styles.stageText}><span>{r.stageLabel}</span><span className={styles.muted}>{r.stageDetail}</span></span>
                <span className={styles.track} role="progressbar" aria-label={`${r.service} stage progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.progress}>
                  <span className={cx(styles.fill, r.health === "degraded" && styles.fillError)} style={{ width: `${r.progress}%` }} />
                </span>
              </td>
              <td><StatusBadge tone={HEALTH_TONE[r.health]}>{r.healthLabel}</StatusBadge></td>
              <td>
                <span className={styles.actions}>
                  {r.actions.map((a) => <DisabledAction key={a.label} label={a.label} variant={a.kind === "mutate" ? "primary" : "neutral"} />)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
