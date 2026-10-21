"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { Table } from "@/components/ui/Table/Table";
import { cx } from "@/lib/cx";
import type { Pipeline, PipelineStatus } from "../../types";
import { PipelineRow, statusLabel } from "./PipelineRow";
import styles from "./PipelinesPanel.module.scss";

type Filter = "all" | PipelineStatus;
const FILTERS: Filter[] = ["all", "running", "queued", "succeeded", "degraded"];

export function PipelinesPanel({ pipelines }: { pipelines: Pipeline[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: pipelines.length, running: 0, queued: 0, succeeded: 0, degraded: 0 };
    for (const p of pipelines) c[p.status] += 1;
    return c;
  }, [pipelines]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pipelines.filter((p) =>
      (filter === "all" || p.status === filter) &&
      (!q || [p.id, p.name, p.track, p.ref, p.commit, p.target].some((v) => v.toLowerCase().includes(q))));
  }, [pipelines, filter, query]);

  return (
    <section className={styles.panel} aria-labelledby="pipelines-h">
      <div className={styles.head}>
        <div className={styles.titleBlock}>
          <Icon name="alt_route" size={20} />
          <div>
            <h2 id="pipelines-h" className={styles.title}>Active CI/CD Deployment Pipelines</h2>
            <p className={styles.caption}>CANARY ORCHESTRATION &amp; SYNCHRONIZED RELEASES</p>
          </div>
        </div>
        <div className={styles.controls}>
          <div role="group" aria-label="Filter by status" className={styles.tabs}>
            {FILTERS.map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} className={cx(styles.tab, filter === f && styles.tabOn)} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : statusLabel(f)} ({counts[f]})
              </button>
            ))}
          </div>
          <label className={styles.search}>
            <Icon name="filter_list" size={16} />
            <span className={styles.srOnly}>Filter pipelines by ID, name, or commit</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter pipeline ID, commit..." />
          </label>
        </div>
      </div>
      {visible.length === 0 ? (
        <p className={styles.empty} role="status">No pipelines match the current filters.</p>
      ) : (
        <Table caption="Mock deployment pipelines">
          <thead>
            <tr>
              {["Pipeline Track", "Commit / Source", "Target Infrastructure", "Stages & Rollout State", "Elapsed", "Health", "Action Vector"].map((h) => <th key={h} scope="col">{h}</th>)}
            </tr>
          </thead>
          <tbody>{visible.map((p) => <PipelineRow key={p.id} p={p} />)}</tbody>
        </Table>
      )}
    </section>
  );
}
