import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { LiveAudit } from "@/features/audit/live/LiveAudit";

export const metadata = { title: "Audit Trail · OpsPilot" };

export default async function Page() {
  await requireSession(PERMISSIONS.auditRead);
  return (
    <>
      <PageHeader eyebrow="Governance" title="Audit Trail & Compliance" description="Every sign-in, invitation, approval and execution in your organization, newest first." />
      <LiveAudit />
    </>
  );
}
