import { redirect } from "next/navigation";
import { isGuardBypassed, PREVIEW_SESSION } from "@/features/auth/dev-bypass";
import { landingPath } from "@/features/auth/navigation";
import { getSession } from "@/features/auth/server/session";
import { Landing } from "@/features/landing/components/Landing";

export const metadata = {
  title: "OpsPilot: failed runs explained, fixes approved by a person",
  description: "OpsPilot syncs your GitHub Actions runs, explains failures with AI, drafts fixes, and runs nothing until a teammate approves.",
};

/** Signed in: straight to the first page you may open. Signed out (or session unclear): the public landing page. */
export default async function Home() {
  if (isGuardBypassed()) redirect(landingPath(PREVIEW_SESSION.permissions) ?? "/unauthorized");
  const result = await getSession();
  if (result.status === "authenticated") {
    if (result.session.mustChangePassword) redirect("/change-password");
    redirect(landingPath(result.session.permissions) ?? "/unauthorized");
  }
  return <Landing />;
}
