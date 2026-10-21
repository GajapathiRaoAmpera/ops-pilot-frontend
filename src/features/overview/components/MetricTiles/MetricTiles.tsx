import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { Sparkline } from "@/components/ui/charts/Sparkline";
import { StatTile } from "@/components/ui/StatTile/StatTile";
import type { DailyRate } from "../../types";
import styles from "./MetricTiles.module.scss";

function SuccessSparkline({ data }: { data: DailyRate[] }) {
  const label = `Daily pipeline success, last 7 days: ${data.map((d) => `${d.day} ${d.rate}%`).join(", ")}`;
  return (
    <div className={styles.spark}>
      <Sparkline values={data.map((d) => d.rate)} labels={data.map((d) => d.day)} name="Success rate" unit="%" ariaLabel={label} />
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
        sub={<><span>1,842 runs executed · +0.3% vs avg</span><SuccessSparkline data={sparkline} /></>}
      />
      <StatTile
        label="Gate Approvals"
        value={<>3 <small className={styles.unit}>Urgent</small></>}
        sub={<><StatusBadge tone="error" icon="priority_high">Action needed</StatusBadge> Canary rollback review on checkout-api</>}
      />
    </section>
  );
}
