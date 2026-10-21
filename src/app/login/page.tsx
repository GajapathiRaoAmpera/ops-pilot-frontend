import { redirect } from "next/navigation";
import { GatewayShell } from "@/components/layout/GatewayShell/GatewayShell";
import { GatewayChooser } from "@/features/auth/components/GatewayChooser/GatewayChooser";
import { landingPath, safeNextPath } from "@/features/auth/navigation";
import { getSession } from "@/features/auth/server/session";

export const metadata = { title: "Sign in · OpsPilot" };

export default async function LoginChooserPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const { next, reason } = await searchParams;
  const result = await getSession();
  if (result.status === "authenticated") {
    redirect(safeNextPath(next) ?? landingPath(result.session.permissions) ?? "/unauthorized");
  }
  const qs = new URLSearchParams();
  if (reason) qs.set("reason", reason);
  const safeNext = safeNextPath(next);
  if (safeNext) qs.set("next", safeNext);

  return (
    <GatewayShell wide>
      <GatewayChooser query={qs.size ? `?${qs}` : ""} />
    </GatewayShell>
  );
}
