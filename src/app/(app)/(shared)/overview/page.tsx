import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";
import { LiveOverview } from "@/features/overview/components/LiveOverview/LiveOverview";
import { LiveSummary } from "@/features/overview/components/LiveSummary/LiveSummary";
import { fetchOverview } from "@/features/overview/server/summary";

export const metadata = { title: "Overview · OpsPilot" };

export default async function Page() {
  const session = await requireSession(PERMISSIONS.overviewRead);
  const ws = await getActiveWorkspace(session);
  const summary = await fetchOverview(ws?.id);
  return (
    <>
      <PageHeader
        title="Overview"
        description={ws ? `What is happening in ${ws.name}: pipeline health, requests waiting for a decision, and recent automation.` : "Pipeline health, approvals and automation for your workspace."}
      />
      <LiveSummary result={summary} />
      {summary.state === "ok" && summary.data.pipelines.connected && <LiveOverview data={summary.data} />}
    </>
  );
}
