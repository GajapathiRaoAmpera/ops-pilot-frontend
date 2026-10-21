"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { Table } from "@/components/ui/Table/Table";
import type { LiveRequest } from "@/features/approvals/live/types";
import styles from "@/features/team/components/Admin.module.scss";
import { callBackend, messageFor } from "@/lib/backend-client";

const TONE: Record<string, Tone> = { succeeded: "success", failed: "error", executing: "accent" };
const when = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString() : "-");

/** Built-in actions are the server's allowlist. Today there is exactly one. */
const ACTIONS = [
  {
    name: "Re-run failed jobs",
    what: "Restarts only the failed jobs of a failed GitHub Actions run. Nothing in the code changes.",
    rule: "Needs approval from someone other than the requester. Runs only after approval, and the result is recorded.",
  },
] as const;

export function LiveAutomation({ workspaceId }: { workspaceId: string }) {
  const [rows, setRows] = useState<LiveRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const q = status ? `?status=${status}` : "";
      const r = await callBackend<{ executions: LiveRequest[] }>("GET", `workspaces/${workspaceId}/executions${q}`);
      if (cancelled) return;
      if (r.ok) { setRows(r.data.executions); setError(null); } else setError(messageFor(r.detail));
    })();
    return () => { cancelled = true; };
  }, [workspaceId, status]);

  return (
    <div className={styles.stack}>
      <Card title="Available actions" flush>
        <Table caption="Available actions">
          <thead><tr><th scope="col">Action</th><th scope="col">What it does</th><th scope="col">Rules</th></tr></thead>
          <tbody>
            {ACTIONS.map((a) => <tr key={a.name}><th scope="row">{a.name}</th><td>{a.what}</td><td>{a.rule}</td></tr>)}
          </tbody>
        </Table>
        <p className={styles.pad}><span className={styles.hint}>More actions and integrations will appear here as they are added.</span></p>
      </Card>

      {error && <Notice variant="error">{error}</Notice>}

      <Card
        title={`Automation history${rows ? ` (${rows.length})` : ""}`} flush
        actions={
          <label className={styles.inline}>
            <span className={styles.hint}>Result</span>
            <select className={styles.select} value={status} onChange={(e) => { setRows(null); setStatus(e.target.value); }}>
              <option value="">All</option><option value="succeeded">Succeeded</option><option value="failed">Failed</option><option value="executing">Running</option>
            </select>
          </label>
        }
      >
        {rows === null && !error ? <p className={styles.pad}>Loading…</p>
          : rows && rows.length === 0 ? (
            <EmptyState title="Nothing has run yet">When an approved request executes, it is listed here with who asked, who approved and what GitHub reported.</EmptyState>
          ) : rows && (
            <Table caption="Automation history">
              <thead><tr><th scope="col">When</th><th scope="col">Run</th><th scope="col">Requested by</th><th scope="col">Approved by</th><th scope="col">Result</th><th scope="col">Detail</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{when(r.execution?.endedAt ?? r.createdAt)}</td>
                    <td>{r.run ? <>{r.run.workflow}<br /><span className={styles.hint}>{r.run.repo} · {r.run.branch}</span></> : "-"}</td>
                    <td>{r.requester?.name ?? "-"}</td>
                    <td>{r.decision?.decidedByName ?? "-"}</td>
                    <td><StatusBadge tone={TONE[r.execution?.status ?? ""] ?? "neutral"}>{r.execution?.status ?? r.status}</StatusBadge></td>
                    <td>
                      {r.execution?.error
                        ? <>GitHub did not accept it ({r.execution.error})</>
                        : typeof r.execution?.result?.observedStatus === "string" ? <>GitHub reports the run as {r.execution.result.observedStatus as string}</> : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
      </Card>
    </div>
  );
}
