import { redirect } from "next/navigation";
import { GatewayShell } from "@/components/layout/GatewayShell/GatewayShell";
import { ChangePassword } from "@/features/auth/components/ChangePassword/ChangePassword";
import { getSession } from "@/features/auth/server/session";

export const metadata = { title: "Change password · OpsPilot" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const result = await getSession();
  if (result.status !== "authenticated") redirect("/login?reason=expired");
  return (
    <GatewayShell>
      <ChangePassword forced={result.session.mustChangePassword} />
    </GatewayShell>
  );
}
