import { MockDataNotice } from "@/components/layout/MockDataNotice/MockDataNotice";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { AutomationCenter } from "@/features/automation/components/AutomationCenter/AutomationCenter";

export default async function Page() {
  await requireSession(PERMISSIONS.automationRead);
  return (
    <>
      <MockDataNotice />
      <AutomationCenter />
    </>
  );
}
