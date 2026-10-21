import { MockDataNotice } from "@/components/layout/MockDataNotice/MockDataNotice";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { RbacScreen } from "@/features/rbac/components/RbacScreen/RbacScreen";

export default async function Page() {
  await requireSession(PERMISSIONS.rbacRead);
  return (
    <>
      <MockDataNotice />
      <RbacScreen />
    </>
  );
}
