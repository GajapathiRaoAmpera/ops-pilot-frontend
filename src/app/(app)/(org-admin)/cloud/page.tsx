import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Notice } from "@/components/ui/Notice/Notice";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";
import { CloudView } from "@/features/cloud/components/CloudView";

export const metadata = { title: "Cloud · OpsPilot" };

export default async function Page() {
  const session = await requireSession(PERMISSIONS.cloudManage);
  const ws = await getActiveWorkspace(session);
  return (
    <>
      <PageHeader eyebrow="Operations" title="Cloud" description="Connect a cloud account read-only and see what runs in it. OpsPilot cannot change anything here." />
      {ws ? <CloudView workspaceId={ws.id} workspaceName={ws.name} /> : <Notice variant="info">No workspace is assigned to your account.</Notice>}
    </>
  );
}
