import { PERMISSIONS } from "@/features/auth/permissions";
import { hasPermission } from "@/features/auth/permissions";
import { requireAnySession } from "@/features/auth/server/session";
import { TeamView } from "@/features/team/components/TeamView";

export const metadata = { title: "Team & Access · OpsPilot" };

export default async function Page() {
  const session = await requireAnySession([PERMISSIONS.membersManage, PERMISSIONS.wsMembersManage]);
  const orgAdmin = hasPermission(session.permissions, PERMISSIONS.membersManage);
  return <TeamView orgAdmin={orgAdmin} workspaces={session.workspaces.map((w) => ({ id: w.id, name: w.name }))} />;
}
