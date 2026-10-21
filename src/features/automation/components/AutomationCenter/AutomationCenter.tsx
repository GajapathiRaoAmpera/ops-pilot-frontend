import { Button } from "@/components/ui/Button/Button";
import { Icon } from "@/components/ui/Icon/Icon";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatTile } from "@/components/ui/StatTile/StatTile";
import { MOCK_SUMMARY } from "../../mock-data";
import { JobHistory } from "../JobHistory/JobHistory";
import { JobStream } from "../JobStream/JobStream";
import { RunbookCatalog } from "../RunbookCatalog/RunbookCatalog";
import { NO_BACKEND } from "../shared";
import styles from "./AutomationCenter.module.scss";

/** Static mock-up of the Automation Center. All run/abort/schedule/import/export controls are disabled. */
export function AutomationCenter() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Autopilot engine v3.4"
        title="Automation Center & Runbook Engine"
        description="Cluster autopilot, scheduled orchestrations, and emergency operational runbooks."
        actions={
          <>
            <Button variant="ghost" disabled title={NO_BACKEND}><Icon name="calendar_month" size={16} />Schedule job</Button>
            <Button variant="ghost" disabled title={NO_BACKEND}><Icon name="cloud_upload" size={16} />Import Ansible/Terraform</Button>
            <Button disabled title={NO_BACKEND}><Icon name="bolt" size={16} />New automation task</Button>
          </>
        }
      />
      <div className={styles.stats}>
        {MOCK_SUMMARY.map((s) => (
          <StatTile key={s.label} label={s.label} value={<>{s.value} {s.chip && <span className={styles.chip}>{s.chip}</span>}</>} sub={s.sub} />
        ))}
      </div>
      <div className={styles.grid}>
        <RunbookCatalog />
        <JobStream />
      </div>
      <JobHistory />
    </div>
  );
}
