import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Notice } from "@/components/ui/Notice/Notice";
import { hasPermission, PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";
import { GithubConnection } from "@/features/settings/components/GithubConnection";

export const metadata = { title: "Workspace Settings · OpsPilot" };

export default async function Page() {
  const session = await requireSession(PERMISSIONS.settingsRead);
  const ws = await getActiveWorkspace(session);
  const canManage = hasPermission(session.permissions, PERMISSIONS.integrationsManage);
  return (
    <>
      <PageHeader eyebrow="Settings" title="Workspace Settings" description="Connect the tools OpsPilot reads from and acts on for this workspace." />
      {!ws ? <Notice variant="info">No workspace is assigned to your account.</Notice>
        : canManage ? <GithubConnection workspaceId={ws.id} workspaceName={ws.name} />
        : <Notice variant="info">Only workspace or organization administrators can change integrations.</Notice>}
    </>
  );
}
