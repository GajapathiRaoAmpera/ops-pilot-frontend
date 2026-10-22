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

export default async function Page({ searchParams }: { searchParams: Promise<{ repo?: string | string[] }> }) {
  const session = await requireSession(PERMISSIONS.pipelinesRead);
  const ws = await getActiveWorkspace(session);
  const raw = (await searchParams).repo;
  const repo = typeof raw === "string" && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(raw) ? raw : undefined;
  const runs = await fetchRuns(ws?.id, repo);
  const canExecute = hasPermission(session.permissions, PERMISSIONS.pipelinesExecute);
  return (
    <>
      <PageHeader title="Pipelines" description="Runs from every repository connected to this workspace. Sync to refresh, filter by repository, and request a re-run of a failed one." />
      <div className={styles.stack}>
        <RunsTrend result={runs} />
        <RunsPanel result={runs} workspaceId={ws?.id} canExecute={canExecute} repo={repo} />
        <MoreIntegrations />
      </div>
    </>
  );
}
