import { MockDataNotice } from "@/components/layout/MockDataNotice/MockDataNotice";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { PipelinesView } from "@/features/pipelines/components/PipelinesView/PipelinesView";

export default async function Page() {
  await requireSession(PERMISSIONS.pipelinesRead);
  return (
    <>
      <MockDataNotice />
      <PipelinesView />
    </>
  );
}
