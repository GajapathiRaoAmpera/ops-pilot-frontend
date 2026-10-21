import { MockDataNotice } from "@/components/layout/MockDataNotice/MockDataNotice";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { AuditLedger } from "@/features/audit/components/AuditLedger/AuditLedger";

export default async function Page() {
  await requireSession(PERMISSIONS.auditRead);
  return (
    <>
      <PageHeader
        eyebrow="Security Auditor"
        title="Audit Trail & Compliance Ledger"
        description="Log of access, role changes, automated jobs, and approval events. Sample data only."
      />
      <MockDataNotice />
      <AuditLedger />
    </>
  );
}
