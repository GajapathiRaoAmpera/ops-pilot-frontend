import { Card } from "@/components/ui/Card/Card";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatTile } from "@/components/ui/StatTile/StatTile";
import type { SummaryResult } from "../../server/summary";
import styles from "./LiveSummary.module.scss";

/** Real figures from the backend for the active workspace. Anything not connected is stated, never invented. */
export function LiveSummary({ result }: { result: SummaryResult }) {
  if (result.state === "no-workspace") return <Notice variant="info">No workspace is assigned to your account.</Notice>;
  if (result.state === "forbidden") return <Notice variant="error">You do not have access to this workspace.</Notice>;
  if (result.state === "error") return <Notice variant="error">Live status is temporarily unavailable.</Notice>;
  const { pipelines: p, approvals, lastExecution, notConnected } = result.data;
  if (!p.connected) return <Notice variant="info">GitHub Actions is not connected for this workspace. Connect it under Settings to see live pipeline status.</Notice>;
  const failed = p.counts.failure ?? 0;
  const ok = p.counts.success ?? 0;
  return (
    <Card title="Live workspace status">
      <div className={styles.tiles}>
        <StatTile label="Recent runs" value={p.total} sub={p.lastSyncedAt ? `Synced ${new Date(p.lastSyncedAt).toLocaleString()}` : "Not synced yet"} />
        <StatTile label="Failed" value={failed} sub="Of the recent runs" />
        <StatTile label="Succeeded" value={ok} sub="Of the recent runs" />
        <StatTile label="Pending approvals" value={approvals.pending} sub={lastExecution ? `Last action: ${lastExecution.status}` : "No actions executed yet"} />
      </div>
      {notConnected.length > 0 && <p className={styles.note}>Not connected yet: {notConnected.join(", ")}.</p>}
    </Card>
  );
}
