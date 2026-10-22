import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Notice } from "@/components/ui/Notice/Notice";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";
import { GithubConnection } from "@/features/settings/components/GithubConnection";

export const metadata = { title: "Workspace Settings · OpsPilot" };

export default async function Page() {
  const session = await requireSession(PERMISSIONS.integrationsManage);
  const ws = await getActiveWorkspace(session);
  return (
    <>
      <PageHeader eyebrow="Settings" title="Workspace Settings" description="Connect the tools OpsPilot reads from and acts on for this workspace." />
      {!ws ? <Notice variant="info">No workspace is assigned to your account.</Notice>
        : <GithubConnection workspaceId={ws.id} workspaceName={ws.name} />}
    </>
  );
}
