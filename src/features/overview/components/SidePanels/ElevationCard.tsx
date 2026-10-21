import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import styles from "./SidePanels.module.scss";

export function ElevationCard() {
  return (
    <Card title="Engineer Elevation" actions={<StatusBadge tone="accent">SecOps-elevated (mock)</StatusBadge>}>
      <div className={styles.inset}>
        <p className={styles.row}><strong>David Vance</strong><span className={styles.mono}>Session: 3h 14m left</span></p>
        <p className={styles.text}>
          You hold <strong>DevOps Lead</strong> authority. Execute permissions granted for canary deployments, config mutations, and cluster node scaling.
        </p>
      </div>
      <p className={styles.note}><Icon name="policy" size={16} />Dual-key validation mandated for production database rollbacks.</p>
    </Card>
  );
}
