import { PlaceholderPage } from "@/components/layout/PlaceholderPage/PlaceholderPage";
import { PERMISSIONS } from "@/features/auth/permissions";
import { requireSession } from "@/features/auth/server/session";

export default async function Page() {
  await requireSession(PERMISSIONS.settingsRead);
  return <PlaceholderPage title="Workspace Settings" stitchScreen="none yet" />;
}
