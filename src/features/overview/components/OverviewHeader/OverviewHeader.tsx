import { Icon } from "@/components/ui/Icon/Icon";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { DisabledAction } from "../DisabledAction/DisabledAction";
import type { MockOverview } from "../../types";
import styles from "./OverviewHeader.module.scss";

export function OverviewHeader({ workspace }: { workspace: MockOverview["workspace"] }) {
  return (
    <>
      <PageHeader
        eyebrow="Dashboards & Operations"
        title="Overview Command Center"
        actions={
          <>
            <DisabledAction label="Switch Workspace" icon={<Icon name="swap_horiz" size={16} />} />
            <DisabledAction label="Trigger Runbook" icon={<Icon name="play_circle" size={16} />} />
            <DisabledAction label="New Deployment" variant="primary" icon={<Icon name="rocket_launch" size={16} />} />
            <DisabledAction label="Incident Response" variant="danger" icon={<Icon name="e911_emergency" size={16} />} />
          </>
        }
      />
      <div className={styles.bar}>
        <p className={styles.scope}>
          <strong>{workspace.org}</strong>
          <span aria-hidden="true">/</span>
          <code>{workspace.environment}</code>
        </p>
        <p className={styles.summary}>
          <Icon name="verified_user" size={16} />
          {workspace.summary.join(" · ")}
        </p>
      </div>
    </>
  );
}
