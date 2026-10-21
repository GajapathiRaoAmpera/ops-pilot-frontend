import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { LiveRbac } from "@/features/rbac/live/LiveRbac";

export const metadata = { title: "RBAC & Permission Matrix · OpsPilot" };

export default async function Page() {
  await requireSession(PERMISSIONS.rbacRead);
  return (
    <>
      <PageHeader eyebrow="Governance" title="RBAC & Permission Matrix" description="What each role can do. Enforced by the server on every request; change membership under Team & Access." />
      <LiveRbac />
    </>
  );
}
