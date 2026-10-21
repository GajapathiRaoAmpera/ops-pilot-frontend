import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { DisabledAction } from "../DisabledAction/DisabledAction";
import styles from "./SidePanels.module.scss";

export function IncidentCard() {
  return (
    <Card title="Active Incident" actions={<><StatusBadge tone="error" icon="crisis_alert">SEV-2</StatusBadge><span className={styles.mono}>INC-409 · 12m ago</span></>}>
      <h3 className={styles.h3}>Latency Spike &amp; Memory Leak</h3>
      <dl className={styles.dl}>
        <dt>Affected target</dt><dd>checkout-api (Canary)</dd>
        <dt>Impact vector</dt><dd className={styles.err}>P99 +420ms · Mem 86%</dd>
      </dl>
      <div className={styles.inset}>
        <p className={styles.row}>
          <span className={styles.ai}><Icon name="auto_awesome" size={16} />OpsPilot Sentinel Diagnostic (AI suggestion)</span>
          <StatusBadge tone="neutral">98% match</StatusBadge>
        </p>
        <p className={styles.text}>
          Unclosed Redis pipeline sockets in commit <code>9a8f2c1</code> preventing garbage collection under concurrent cart checkout transactions.
        </p>
      </div>
      <div className={styles.stack}>
        <DisabledAction label="Trigger Immediate Canary Rollback" variant="danger" icon={<Icon name="undo" size={16} />} className={styles.wide} />
        <div className={styles.pair}>
          <DisabledAction label="Drain Traffic (50%)" />
          <DisabledAction label="Inspect Dump" />
        </div>
      </div>
    </Card>
  );
}
