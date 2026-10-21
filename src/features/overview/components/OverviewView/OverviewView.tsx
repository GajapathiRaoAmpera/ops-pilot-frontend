import { MOCK_OVERVIEW } from "../../mock-data";
import { ExecutionStream } from "../ExecutionStream/ExecutionStream";
import { MetricTiles } from "../MetricTiles/MetricTiles";
import { OverviewHeader } from "../OverviewHeader/OverviewHeader";
import { PipelineFabric } from "../PipelineFabric/PipelineFabric";
import { ApprovalsCard } from "../SidePanels/ApprovalsCard";
import { ElevationCard } from "../SidePanels/ElevationCard";
import { IncidentCard } from "../SidePanels/IncidentCard";
import styles from "./OverviewView.module.scss";

export function OverviewView() {
  const d = MOCK_OVERVIEW;
  return (
    <div className={styles.view}>
      <OverviewHeader workspace={d.workspace} />
      <MetricTiles sparkline={d.sparkline} />
      <div className={styles.split}>
        <div className={styles.main}>
          <PipelineFabric rows={d.pipelines} />
          <ExecutionStream logs={d.logs} footer={d.streamFooter} />
        </div>
        <aside className={styles.side} aria-label="Role, incident and approvals (mock data)">
          <ElevationCard />
          <IncidentCard />
          <ApprovalsCard />
        </aside>
      </div>
    </div>
  );
}
