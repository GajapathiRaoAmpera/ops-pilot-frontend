import { notFound, redirect } from "next/navigation";
import { GatewayShell } from "@/components/layout/GatewayShell/GatewayShell";
import { GatewayLogin } from "@/features/auth/components/GatewayLogin/GatewayLogin";
import { findGateway } from "@/features/auth/gateways";
import { landingPath, safeNextPath } from "@/features/auth/navigation";
import { getSession } from "@/features/auth/server/session";

const NOTICES: Record<string, string> = {
  expired: "Your session has expired. Please sign in again.",
  unavailable: "We couldn't verify your session. Please sign in again.",
  signed_out: "You have been signed out.",
};

export async function generateMetadata({ params }: { params: Promise<{ gateway: string }> }) {
  const g = findGateway((await params).gateway);
  return { title: g ? `${g.title} sign in · OpsPilot` : "Sign in · OpsPilot" };
}

export default async function GatewayLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ gateway: string }>;
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const gateway = findGateway((await params).gateway);
  if (!gateway) notFound();
  const { next, reason } = await searchParams;

  const result = await getSession();
  if (result.status === "authenticated") {
    redirect(safeNextPath(next) ?? landingPath(result.session.permissions) ?? "/unauthorized");
  }

  return (
    <GatewayShell wide>
      <GatewayLogin gateway={gateway} next={safeNextPath(next)} notice={reason ? NOTICES[reason] : undefined} />
    </GatewayShell>
  );
}
