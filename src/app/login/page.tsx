import { redirect } from "next/navigation";
import { GatewayShell } from "@/components/layout/GatewayShell/GatewayShell";
import { SignIn } from "@/features/auth/components/SignIn/SignIn";
import { landingPath, safeNextPath } from "@/features/auth/navigation";
import { getSession } from "@/features/auth/server/session";

export const metadata = { title: "Sign in · OpsPilot" };

const NOTICES: Record<string, string> = {
  expired: "Your session has expired. Please sign in again.",
  unavailable: "We couldn't verify your session. Please sign in again.",
  signed_out: "You have been signed out.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const { next, reason } = await searchParams;
  const result = await getSession();
  if (result.status === "authenticated") {
    redirect(safeNextPath(next) ?? landingPath(result.session.permissions) ?? "/unauthorized");
  }
  return (
    <GatewayShell wide>
      <SignIn next={safeNextPath(next)} notice={reason ? NOTICES[reason] : undefined} />
    </GatewayShell>
  );
}
