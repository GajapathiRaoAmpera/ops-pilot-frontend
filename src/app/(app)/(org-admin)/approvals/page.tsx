import { MockDataNotice } from "@/components/layout/MockDataNotice/MockDataNotice";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { ApprovalsInbox } from "@/features/approvals/components/ApprovalsInbox/ApprovalsInbox";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";

export default async function Page() {
  await requireSession(PERMISSIONS.approvalsRead);
  return (
    <>
      <PageHeader
        eyebrow="Governance"
        title="Approvals Inbox"
        description="Review change requests awaiting sign-off."
      />
      <MockDataNotice />
      <ApprovalsInbox />
    </>
  );
}
