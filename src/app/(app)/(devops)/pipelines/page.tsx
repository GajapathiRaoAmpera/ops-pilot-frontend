import { MockDataNotice } from "@/components/layout/MockDataNotice/MockDataNotice";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { PipelinesView } from "@/features/pipelines/components/PipelinesView/PipelinesView";
import { RunsPanel } from "@/features/pipelines/components/RunsPanel/RunsPanel";
import { fetchRuns } from "@/features/pipelines/server/runs";

export default async function Page() {
  const session = await requireSession(PERMISSIONS.pipelinesRead);
  const runs = await fetchRuns(session.workspaces[0]?.id);
  return (
    <>
      <RunsPanel result={runs} />
      <MockDataNotice />
      <PipelinesView />
    </>
  );
}
