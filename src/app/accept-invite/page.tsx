import { GatewayShell } from "@/components/layout/GatewayShell/GatewayShell";
import { backendFetch } from "@/features/auth/server/backend";
import { getSession } from "@/features/auth/server/session";
import { AcceptInvite, type InvitePreview } from "@/features/invitations/components/AcceptInvite";

export const metadata = { title: "Accept invitation · OpsPilot" };
export const dynamic = "force-dynamic";

async function loadPreview(token: string): Promise<InvitePreview | null> {
  if (!/^[A-Za-z0-9_-]{20,200}$/.test(token)) return null;
  try {
    const res = await backendFetch(`/invitations/${token}`);
    return res.ok ? ((await res.json()) as InvitePreview) : null;
  } catch {
    return null;
  }
}

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const [preview, session] = await Promise.all([loadPreview(token), getSession()]);
  return (
    <GatewayShell>
      <AcceptInvite token={token} preview={preview} signedInEmail={session.status === "authenticated" ? session.session.user.email : null} />
    </GatewayShell>
  );
}
