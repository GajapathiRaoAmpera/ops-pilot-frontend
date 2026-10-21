import { MockDataNotice } from "@/components/layout/MockDataNotice/MockDataNotice";
import { hasPermission, PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";
import { PipelinesView } from "@/features/pipelines/components/PipelinesView/PipelinesView";
import { RunsTrend } from "@/features/pipelines/components/RunsTrend/RunsTrend";
import { RunsPanel } from "@/features/pipelines/components/RunsPanel/RunsPanel";
import { fetchRuns } from "@/features/pipelines/server/runs";

export default async function Page() {
  const session = await requireSession(PERMISSIONS.pipelinesRead);
  const ws = await getActiveWorkspace(session);
  const runs = await fetchRuns(ws?.id);
  const canExecute = hasPermission(session.permissions, PERMISSIONS.pipelinesExecute);
  return (
    <>
      <RunsTrend result={runs} />
      <RunsPanel result={runs} workspaceId={ws?.id} canExecute={canExecute} />
      <MockDataNotice />
      <PipelinesView />
    </>
  );
}
