import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { DisabledAction } from "../DisabledAction/DisabledAction";
import styles from "./SidePanels.module.scss";

export function ApprovalsCard() {
  return (
    <Card title="Pending Approval Gates" actions={<StatusBadge tone="info">1 urgent</StatusBadge>}>
      <div className={styles.inset}>
        <p className={styles.row}><strong>Emergency Rollback Approval</strong><span className={styles.mono}>REQ-8021</span></p>
        <p className={styles.text}>
          Initiated by SRE Sentinel Automation for <code>checkout-api</code>. Awaiting DevOps Lead dual-authorization.
        </p>
        <p className={styles.row}><span className={styles.mono}>Expires in 18:22</span><DisabledAction label="Review & Authorize" variant="primary" /></p>
      </div>
      <p className={styles.queued}><span><Icon name="schedule" size={16} /> DB Migration (billing-db)</span><span className={styles.mono}>Scheduled 02:00</span></p>
    </Card>
  );
}
