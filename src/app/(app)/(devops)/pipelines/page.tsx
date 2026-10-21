import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { hasPermission, PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";
import styles from "@/features/team/components/Admin.module.scss";
import { MoreIntegrations } from "@/features/pipelines/components/MoreIntegrations/MoreIntegrations";
import { RunsPanel } from "@/features/pipelines/components/RunsPanel/RunsPanel";
import { RunsTrend } from "@/features/pipelines/components/RunsTrend/RunsTrend";
import { fetchRuns } from "@/features/pipelines/server/runs";

export const metadata = { title: "Pipelines · OpsPilot" };

export default async function Page() {
  const session = await requireSession(PERMISSIONS.pipelinesRead);
  const ws = await getActiveWorkspace(session);
  const runs = await fetchRuns(ws?.id);
  const canExecute = hasPermission(session.permissions, PERMISSIONS.pipelinesExecute);
  return (
    <>
      <PageHeader title="Pipelines" description="Real runs from your connected repository. Sync to refresh, and request a re-run of a failed one." />
      <div className={styles.stack}>
        <RunsTrend result={runs} />
        <RunsPanel result={runs} workspaceId={ws?.id} canExecute={canExecute} />
        <MoreIntegrations />
      </div>
    </>
  );
}
