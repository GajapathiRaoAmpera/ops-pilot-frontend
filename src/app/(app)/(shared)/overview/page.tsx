import { MockDataNotice } from "@/components/layout/MockDataNotice/MockDataNotice";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";
import { LiveSummary } from "@/features/overview/components/LiveSummary/LiveSummary";
import { OverviewView } from "@/features/overview/components/OverviewView/OverviewView";
import { fetchOverview } from "@/features/overview/server/summary";

export default async function Page() {
  const session = await requireSession(PERMISSIONS.overviewRead);
  const ws = await getActiveWorkspace(session);
  const summary = await fetchOverview(ws?.id);
  return (
    <>
      <LiveSummary result={summary} />
      <MockDataNotice />
      <OverviewView />
    </>
  );
}
