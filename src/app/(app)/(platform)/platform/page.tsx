import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";
import { PlatformView } from "@/features/platform/components/PlatformView";

export const metadata = { title: "Organizations · OpsPilot" };

export default async function Page() {
  await requireSession(PERMISSIONS.platformOrgs);
  return <PlatformView />;
}
