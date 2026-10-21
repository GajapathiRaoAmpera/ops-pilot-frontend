import { Button } from "@/components/ui/Button/Button";
import { Icon } from "@/components/ui/Icon/Icon";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { incident } from "../../mock-data";
import { ChatPanel } from "../ChatPanel/ChatPanel";
import { InvestigationLog } from "../InvestigationLog/InvestigationLog";
import { MitigationOptions } from "../MitigationOptions/MitigationOptions";
import { TelemetryPanel } from "../TelemetryPanel/TelemetryPanel";
import { TopologyPanel } from "../TopologyPanel/TopologyPanel";
import styles from "./CopilotView.module.scss";

const NC = "Not connected to a backend. Nothing will be executed.";

export function CopilotView() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="AI & Incidents"
        title="OpsPilot AI SRE Sentinel"
        description="Incident triage, root cause analysis, and guided remediation suggestions. All AI output here is a mock suggestion; nothing has been executed."
        actions={
          <>
            <Button variant="ghost" disabled title={NC}><Icon name="tune" size={16} /> Sentinel Settings</Button>
            <Button variant="ghost" disabled title={NC}><Icon name="download" size={16} /> Export Diagnostic Report</Button>
            <Button variant="ghost" disabled title={NC}><Icon name="restart_alt" size={16} /> Clear Context</Button>
          </>
        }
      />
      <section aria-label="Sample incident" className={styles.incident}>
        <Icon name="warning" size={20} />
        <span className={styles.mono}>{incident.id}</span>
        <StatusBadge tone="error">{incident.severity}</StatusBadge>
        <span>{incident.title} <code className={styles.code}>{incident.resource}</code> {incident.scope}</span>
        <span className={styles.meta}>
          <StatusBadge tone="neutral">Mock snapshot</StatusBadge>
          <span className={styles.mono}>{incident.elapsed}</span>
          <span className={styles.mono}>{incident.triage}</span>
        </span>
      </section>
      <div className={styles.grid}>
        <div className={styles.col}><TelemetryPanel /><TopologyPanel /></div>
        <div className={styles.col}><InvestigationLog /><MitigationOptions /></div>
        <div className={styles.col}><ChatPanel /></div>
      </div>
    </div>
  );
}
