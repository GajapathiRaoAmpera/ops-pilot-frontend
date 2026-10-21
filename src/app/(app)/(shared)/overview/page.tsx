import { MockDataNotice } from "@/components/layout/MockDataNotice/MockDataNotice";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { OverviewView } from "@/features/overview/components/OverviewView/OverviewView";

export default async function Page() {
  await requireSession(PERMISSIONS.overviewRead);
  return (
    <>
      <MockDataNotice />
      <OverviewView />
    </>
  );
}
