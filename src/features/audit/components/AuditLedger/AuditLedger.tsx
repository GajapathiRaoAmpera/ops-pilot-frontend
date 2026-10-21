"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { StatTile } from "@/components/ui/StatTile/StatTile";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { Table } from "@/components/ui/Table/Table";
import { DEFAULT_FILTERS, filterEvents } from "../../filterEvents";
import { MOCK_ACTIONS, MOCK_ENVS, MOCK_EVENTS, MOCK_ORGS, MOCK_SEVERITIES, MOCK_KPIS, MOCK_LEDGER_LABELS, RANGES } from "../../mock-data";
import { ALL, type AuditFilters, type Severity } from "../../types";
import styles from "./AuditLedger.module.scss";

const SEVERITY_TONE: Record<Severity, Tone> = { critical: "error", warning: "warning", info: "info" };
const label = (opts: { value: string; label: string }[], v: string) => opts.find((o) => o.value === v)?.label ?? v;

function Select({ id, name, value, options, allLabel, onChange }: {
  id: string; name: string; value: string; options: { value: string; label: string }[]; allLabel: string; onChange: (v: string) => void;
}) {
  return (
    <div className={styles.selectWrap}>
      <label htmlFor={id}>{name}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value={ALL}>{allLabel}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function AuditLedger() {
  const [filters, setFilters] = useState<AuditFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const set = (k: keyof AuditFilters) => (v: string) => setFilters((f) => ({ ...f, [k]: v }));

  const rows = useMemo(() => filterEvents(MOCK_EVENTS, filters), [filters]);
  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className={styles.root}>
      <div className={styles.labels} aria-label="Mock attestation labels">
        <StatusBadge tone="neutral" icon="science">Mock label: WORM attested</StatusBadge>
        <StatusBadge tone="neutral" icon="science">Mock label: SHA256 Verified</StatusBadge>
        <span className={styles.hint}>Illustrative only. No ledger integrity check has been performed.</span>
      </div>

      <div className={styles.labels}>
        <StatusBadge tone="neutral" icon="lock_clock">{MOCK_LEDGER_LABELS.banner}</StatusBadge>
        <span className={styles.hint}>{MOCK_LEDGER_LABELS.merkle}</span>
        <StatusBadge tone="info" icon="database">{`Retention policy: ${MOCK_LEDGER_LABELS.retention}`}</StatusBadge>
      </div>

      <div className={styles.kpis}>
        {MOCK_KPIS.map((k) => <StatTile key={k.label} label={k.label} value={k.value} sub={k.sub} />)}
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" disabled aria-describedby="audit-sim-na"><Icon name="terminal" size={16} /> Simulate Query</Button>
        <span id="audit-sim-na" className={styles.na}>Not connected</span>
        <Button disabled aria-describedby="audit-exp-na"><Icon name="download_done" size={16} /> Export audit bundle</Button>
        <span id="audit-exp-na" className={styles.na}>Not connected</span>
      </div>

      <Card title="Filters">
        <form className={styles.filters} role="search" onSubmit={(e) => e.preventDefault()}>
          <div className={styles.searchWrap}>
            <label htmlFor="audit-search">Search</label>
            <input id="audit-search" type="search" value={filters.search} placeholder="Correlation ID, actor, resource, target"
              onChange={(e) => set("search")(e.target.value)} />
          </div>
          <Select id="audit-org" name="Organization" value={filters.org} options={MOCK_ORGS} allLabel="All organizations" onChange={set("org")} />
          <Select id="audit-env" name="Environment" value={filters.env} options={MOCK_ENVS} allLabel="All environments" onChange={set("env")} />
          <Select id="audit-sev" name="Severity" value={filters.severity} options={MOCK_SEVERITIES} allLabel="All severities" onChange={set("severity")} />
          <Select id="audit-act" name="Action" value={filters.action} options={MOCK_ACTIONS} allLabel="All actions" onChange={set("action")} />
          <div className={styles.selectWrap}>
            <label htmlFor="audit-range">Date range</label>
            <select id="audit-range" value={filters.range} onChange={(e) => set("range")(e.target.value)}>
              {RANGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <Button type="button" variant="ghost" disabled={!isFiltered} onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</Button>
        </form>
        <p className={styles.count} role="status">Showing {rows.length} of {MOCK_EVENTS.length} mock sample entries ({MOCK_LEDGER_LABELS.totalEntries} total is a static mock figure)</p>
      </Card>

      <div className={styles.split}>
        <Card title="Event stream" flush actions={
          <span className={styles.toolbar}>
            <StatusBadge tone="neutral">Mock snapshot</StatusBadge>
            <button type="button" className={styles.iconBtn} disabled aria-label="Pause stream (not connected, no live stream)" title="Not connected: this is a static snapshot">
              <Icon name="pause" size={16} />
            </button>
          </span>
        }>
          {rows.length === 0 ? (
            <p className={styles.empty}>No mock events match the current filters.</p>
          ) : (
            <Table caption="Mock audit events">
              <thead>
                <tr>
                  <th scope="col">Time (UTC)</th><th scope="col">Correlation ID</th><th scope="col">Actor</th>
                  <th scope="col">Resource</th><th scope="col">Target</th><th scope="col">Severity</th><th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className={e.id === selectedId ? styles.selected : undefined}>
                    <td className={styles.mono}>{e.timestamp}</td>
                    <td>
                      <button type="button" className={styles.rowButton} aria-pressed={e.id === selectedId}
                        onClick={() => setSelectedId(e.id === selectedId ? null : e.id)}>
                        {e.correlationId}
                      </button>
                    </td>
                    <td>{e.actor}<br /><span className={styles.sub}>{e.actorRole}</span></td>
                    <td className={styles.mono}>{e.resource}</td>
                    <td className={styles.mono}>{e.target}</td>
                    <td><StatusBadge tone={SEVERITY_TONE[e.severity]}>{label(MOCK_SEVERITIES, e.severity)}</StatusBadge></td>
                    <td>
                      {e.result === "denied"
                        ? <StatusBadge tone="error" icon="block">Denied</StatusBadge>
                        : <StatusBadge tone="success" icon="check">Success</StatusBadge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <footer className={styles.pager}>
            <span className={styles.mono}>{MOCK_LEDGER_LABELS.height}</span>
            <span className={styles.pagerCtl}>
              <Button variant="ghost" disabled>Previous</Button>
              <span className={styles.mono}>Page 1 of {MOCK_LEDGER_LABELS.pages} (static mock)</span>
              <Button variant="ghost" disabled>Next</Button>
            </span>
          </footer>
        </Card>

        <Card title="Event details (mock)">
          {selected ? (
            <dl className={styles.details}>
              <dt>Correlation ID</dt><dd>{selected.correlationId}</dd>
              <dt>Actor</dt><dd>{selected.actor} ({selected.actorRole})</dd>
              <dt>Organization</dt><dd>{label(MOCK_ORGS, selected.org)}</dd>
              <dt>Environment</dt><dd>{label(MOCK_ENVS, selected.env)}</dd>
              <dt>Action type</dt><dd>{label(MOCK_ACTIONS, selected.action)}</dd>
              <dt>Auth method</dt><dd>{selected.authMethod}</dd>
              <dt>Summary</dt><dd>{selected.detail}</dd>
              <dt>State mutation (mock diff)</dt>
              <dd>
                {selected.diff ? (
                  <>
                    <span className={styles.sub}>Before</span><pre className={styles.pre}>{selected.diff.before}</pre>
                    <span className={styles.sub}>After</span><pre className={styles.pre}>{selected.diff.after}</pre>
                  </>
                ) : "No state change recorded in this mock row."}
              </dd>
            </dl>
          ) : (
            <p className={styles.empty}>Select a correlation ID to view mock event details.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
