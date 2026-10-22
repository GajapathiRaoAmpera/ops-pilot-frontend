import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Notice } from "@/components/ui/Notice/Notice";
import { hasPermission, PERMISSIONS } from "@/features/auth/permissions";
import { requireAnySession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";
import { LiveAudit } from "@/features/audit/live/LiveAudit";

export const metadata = { title: "Audit Trail · OpsPilot" };

export default async function Page() {
  const session = await requireAnySession([PERMISSIONS.auditRead, PERMISSIONS.wsAuditRead]);
  // Organization auditors see everything; workspace administrators see the workspace they are in.
  if (hasPermission(session.permissions, PERMISSIONS.auditRead)) {
    return (
      <>
        <PageHeader eyebrow="Governance" title="Audit Trail & Compliance" description="Every sign-in, invitation, approval and execution in your organization, newest first." />
        <LiveAudit />
      </>
    );
  }
  const ws = await getActiveWorkspace(session);
  return (
    <>
      <PageHeader eyebrow="Governance" title="Audit Trail" description={ws ? `Everything recorded in the ${ws.name} workspace, newest first.` : "Workspace activity, newest first."} />
      {ws ? <LiveAudit key={ws.id} workspace={{ id: ws.id, name: ws.name }} /> : <Notice variant="info">No workspace is assigned to your account.</Notice>}
    </>
  );
}
