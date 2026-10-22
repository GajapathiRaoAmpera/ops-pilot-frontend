import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { CloudView } from "@/features/cloud/components/CloudView";

export const metadata = { title: "Cloud · OpsPilot" };

export default async function Page() {
  const session = await requireSession(PERMISSIONS.cloudManage);
  return (
    <>
      <PageHeader eyebrow="Operations" title="Cloud"
        description="Your organization's cloud account, connected read-only and shared by every workspace. OpsPilot cannot change anything here." />
      <CloudView organizationName={session.organization.name} />
    </>
  );
}
