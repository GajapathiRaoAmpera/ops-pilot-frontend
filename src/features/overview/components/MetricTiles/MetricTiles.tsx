import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { StatTile } from "@/components/ui/StatTile/StatTile";
import type { DailyRate } from "../../types";
import styles from "./MetricTiles.module.scss";

function Sparkline({ data }: { data: DailyRate[] }) {
  const label = `Daily pipeline success, last 7 days: ${data.map((d) => `${d.day} ${d.rate}%`).join(", ")}`;
  return (
    <div className={styles.spark} role="img" aria-label={label}>
      {data.map((d) => (
        <span key={d.day} title={`${d.day}: ${d.rate}%`} style={{ height: `${Math.max(20, (d.rate - 98) * 50)}%` }} />
      ))}
    </div>
  );
}

export function MetricTiles({ sparkline }: { sparkline: DailyRate[] }) {
  return (
    <section aria-label="Key metrics (mock snapshot)" className={styles.grid}>
      <StatTile
        label="Cloud Meshes"
        value={<>99.98<small className={styles.unit}>% synced</small></>}
        sub={<><StatusBadge tone="success">4 active</StatusBadge> AWS 18ms / GCP 24ms · Azure eastus2 (12ms) · Equinix Baremetal OK</>}
      />
      <StatTile
        label="Active Orchestrations"
        value={<>6 <small className={styles.unit}>Active</small></>}
        sub={<><StatusBadge tone="neutral">2 queued</StatusBadge> <StatusBadge tone="neutral" icon="photo_camera">Mock snapshot</StatusBadge></>}
      />
      <StatTile
        label="Pipeline Success (7d)"
        value="99.4%"
        sub={<><span>1,842 runs executed · +0.3% vs avg</span><Sparkline data={sparkline} /></>}
      />
      <StatTile
        label="Gate Approvals"
        value={<>3 <small className={styles.unit}>Urgent</small></>}
        sub={<><StatusBadge tone="error" icon="priority_high">Action needed</StatusBadge> Canary rollback review on checkout-api</>}
      />
    </section>
  );
}
