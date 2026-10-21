"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { Table } from "@/components/ui/Table/Table";
import styles from "@/features/team/components/Admin.module.scss";
import { callBackend, messageFor } from "@/lib/backend-client";

export interface LiveEvent {
  id: number; ts: string; actorName: string | null; actorEmail: string | null;
  action: string; resource: string; outcome: string; detail: string;
}
interface Page { events: LiveEvent[]; nextBefore: number | null }

/** Server-side filters and cursor paging. Event text is rendered as plain text (React-escaped). */
export function LiveAudit() {
  const [events, setEvents] = useState<LiveEvent[] | null>(null);
  const [next, setNext] = useState<number | null>(null);
  const [outcome, setOutcome] = useState("");
  const [action, setAction] = useState("");
  const [applied, setApplied] = useState({ outcome: "", action: "" });
  const [error, setError] = useState<string | null>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const q = new URLSearchParams({ limit: "50" });
      if (applied.outcome) q.set("outcome", applied.outcome);
      if (applied.action) q.set("action", applied.action);
      const r = await callBackend<Page>("GET", `audit-events?${q}`);
      if (cancelled) return;
      if (r.ok) { setEvents(r.data.events); setNext(r.data.nextBefore); setError(null); } else setError(messageFor(r.detail));
    })();
    return () => { cancelled = true; };
  }, [applied]);

  async function loadMore() {
    if (next === null) return;
    setMore(true);
    const q = new URLSearchParams({ limit: "50", before_id: String(next) });
    if (applied.outcome) q.set("outcome", applied.outcome);
    if (applied.action) q.set("action", applied.action);
    const r = await callBackend<Page>("GET", `audit-events?${q}`);
    setMore(false);
    if (!r.ok) return setError(messageFor(r.detail));
    setEvents((cur) => [...(cur ?? []), ...r.data.events]);
    setNext(r.data.nextBefore);
  }

  return (
    <div className={styles.stack}>
      <Card title="Filters" flush>
        <form className={styles.form} role="search" onSubmit={(e) => { e.preventDefault(); setEvents(null); setApplied({ outcome, action: action.trim() }); }}>
          <label className={styles.selectField}>Action (exact, e.g. approval.approve)
            <input className={styles.select} value={action} maxLength={100} onChange={(e) => setAction(e.target.value)} />
          </label>
          <label className={styles.selectField}>Outcome
            <select className={styles.select} value={outcome} onChange={(e) => setOutcome(e.target.value)}>
              <option value="">All</option><option value="success">Success</option><option value="failure">Failure</option>
            </select>
          </label>
          <span />
          <Button type="submit">Apply</Button>
        </form>
      </Card>
      {error && <Notice variant="error">{error}</Notice>}
      <Card title={`Audit events${events ? ` (${events.length}${next !== null ? "+" : ""})` : ""}`} flush>
        {events === null && !error ? <p className={styles.pad}>Loading…</p>
          : events && events.length === 0 ? <p className={styles.pad}>No events match.</p>
          : events && (
            <Table caption="Audit events">
              <thead><tr><th scope="col">Time</th><th scope="col">Actor</th><th scope="col">Action</th><th scope="col">Resource</th><th scope="col">Outcome</th><th scope="col">Detail</th></tr></thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>{new Date(e.ts).toLocaleString()}</td>
                    <td>{e.actorName ?? "-"}<br /><span className={styles.hint}>{e.actorEmail ?? ""}</span></td>
                    <td>{e.action}</td><td>{e.resource}</td>
                    <td><StatusBadge tone={e.outcome === "success" ? "success" : "error"}>{e.outcome}</StatusBadge></td>
                    <td>{e.detail}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
      </Card>
      {next !== null && <div><Button variant="ghost" loading={more} disabled={more} onClick={() => void loadMore()}>Load older events</Button></div>}
    </div>
  );
}
