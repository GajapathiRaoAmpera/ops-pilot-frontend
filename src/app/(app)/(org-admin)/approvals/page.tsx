import { Notice } from "@/components/ui/Notice/Notice";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { LiveApprovals } from "@/features/approvals/live/LiveApprovals";
import { hasPermission, PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";

export const metadata = { title: "Approvals Inbox · OpsPilot" };

export default async function Page() {
  const session = await requireSession(PERMISSIONS.approvalsRead);
  const ws = await getActiveWorkspace(session);
  return (
    <>
      <PageHeader eyebrow="Governance" title="Approvals Inbox" description="Review change requests. Nothing runs until someone other than the requester approves it." />
      {ws ? <LiveApprovals key={ws.id} workspaceId={ws.id} canDecide={hasPermission(session.permissions, PERMISSIONS.approvalsDecide)} />
        : <Notice variant="info">No workspace is assigned to your account.</Notice>}
    </>
  );
}
