import Link from "next/link";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { RunsPanel } from "@/features/pipelines/components/RunsPanel/RunsPanel";
import type { OverviewSummary } from "../../server/summary";
import styles from "./LiveOverview.module.scss";

const EXEC_TONE: Record<string, Tone> = { succeeded: "success", failed: "error", executing: "accent" };
const RISK_TONE: Record<string, Tone> = { high: "error", medium: "warning", low: "neutral" };
const when = (iso: string) => new Date(iso).toLocaleString();

/** Real activity for the workspace. A section the viewer may not see is replaced by a plain explanation. */
export function LiveOverview({ data }: { data: OverviewSummary }) {
  const { approvals, recentExecutions, activity, visible, pipelines } = data;
  return (
    <div className={styles.stack}>
      <div className={styles.grid}>
        <Card title={`Needs a decision${visible.approvals ? ` (${approvals.pending})` : ""}`} flush
          actions={visible.approvals ? <Link href="/approvals" className={styles.link}>Open approvals</Link> : undefined}>
          {!visible.approvals ? (
            <EmptyState title="Approvals are not shown to your role">{approvals.pending} request{approvals.pending === 1 ? " is" : "s are"} waiting for someone with approval rights.</EmptyState>
          ) : approvals.items.length === 0 ? (
            <EmptyState title="Nothing is waiting">Requests to re-run a failed pipeline appear here until someone approves or rejects them.</EmptyState>
          ) : (
            <ul className={styles.list} aria-label="Requests waiting for a decision">
              {approvals.items.map((i) => (
                <li key={i.id} className={styles.item}>
                  <span className={styles.title}>Re-run failed jobs · {i.workflow}</span>
                  <span className={styles.meta}>{i.repo} · {i.branch} · asked by {i.requester ?? "unknown"} · {when(i.createdAt)}</span>
                  <StatusBadge tone={RISK_TONE[i.risk] ?? "neutral"}>{`${i.risk} risk`}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent automation" flush actions={visible.executions ? <Link href="/automation" className={styles.link}>Open automation</Link> : undefined}>
          {!visible.executions ? (
            <EmptyState title="Automation history is not shown to your role">Ask an administrator if you need access.</EmptyState>
          ) : recentExecutions.length === 0 ? (
            <EmptyState title="Nothing has run yet">Approved re-runs show up here with their result.</EmptyState>
          ) : (
            <ul className={styles.list} aria-label="Recent automation">
              {recentExecutions.map((e) => (
                <li key={e.id} className={styles.item}>
                  <span className={styles.title}>Re-run failed jobs · {e.workflow}</span>
                  <span className={styles.meta}>{e.repo} · {when(e.createdAt)}</span>
                  <StatusBadge tone={EXEC_TONE[e.status] ?? "neutral"}>{e.status}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <RunsPanel result={{ state: "ok", connected: pipelines.connected, lastSyncedAt: pipelines.lastSyncedAt, runs: pipelines.recent }} />

      {visible.activity && (
        <Card title="Workspace activity" flush actions={<Link href="/audit" className={styles.link}>Open audit trail</Link>}>
          {activity.length === 0 ? (
            <EmptyState title="No activity recorded yet">Syncs, requests, approvals and executions in this workspace are listed here.</EmptyState>
          ) : (
            <ul className={styles.list} aria-label="Workspace activity">
              {activity.map((a) => (
                <li key={a.id} className={styles.item}>
                  <span className={styles.title}>{a.action}</span>
                  <span className={styles.meta}>{a.actor ?? "system"} · {a.resource || "-"} · {when(a.ts)}</span>
                  <StatusBadge tone={a.outcome === "success" ? "success" : "error"}>{a.outcome}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
