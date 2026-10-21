import { MockDataNotice } from "@/components/layout/MockDataNotice/MockDataNotice";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { CopilotView } from "@/features/copilot/components/CopilotView/CopilotView";

export default async function Page() {
  await requireSession(PERMISSIONS.copilotUse);
  return (
    <>
      <MockDataNotice />
      <CopilotView />
    </>
  );
}
