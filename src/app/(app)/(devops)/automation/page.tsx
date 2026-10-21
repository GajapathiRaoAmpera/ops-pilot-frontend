import { Notice } from "@/components/ui/Notice/Notice";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";
import { LiveAutomation } from "@/features/automation/live/LiveAutomation";

export const metadata = { title: "Automation · OpsPilot" };

export default async function Page() {
  const session = await requireSession(PERMISSIONS.automationRead);
  const ws = await getActiveWorkspace(session);
  return (
    <>
      <PageHeader title="Automation" description="The actions OpsPilot can take on your behalf, and a record of every time one ran." />
      {ws ? <LiveAutomation key={ws.id} workspaceId={ws.id} /> : <Notice variant="info">No workspace is assigned to your account.</Notice>}
    </>
  );
}
