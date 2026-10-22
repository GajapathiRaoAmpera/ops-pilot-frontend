import { AppShell } from "@/components/layout/AppShell/AppShell";
import { PreviewBanner } from "@/components/layout/PreviewBanner/PreviewBanner";
import { LogoutButton } from "@/features/auth/components/LogoutButton/LogoutButton";
import { NavLinks } from "@/features/auth/components/NavLinks/NavLinks";
import { SessionProvider } from "@/features/auth/components/SessionProvider";
import { isGuardBypassed } from "@/features/auth/dev-bypass";
import { requireSession } from "@/features/auth/server/session";
import { getActiveWorkspace } from "@/features/auth/server/workspace";
import { PilotDock } from "@/features/pilot/PilotDock";
import { OrganizationSwitcher } from "@/features/workspace/OrganizationSwitcher";
import { WorkspaceSwitcher } from "@/features/workspace/WorkspaceSwitcher";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const active = await getActiveWorkspace(session);

  return (
    <SessionProvider session={session}>
      <AppShell
        organizationName={session.organization.name}
        organization={<OrganizationSwitcher />}
        userName={session.user.name}
        userRole={active ? `${session.role} · ${active.name}` : session.role}
        nav={<NavLinks />}
        accountActions={<><WorkspaceSwitcher activeId={active?.id} /><LogoutButton /></>}
        banner={isGuardBypassed() ? <PreviewBanner /> : undefined}
      >
        {children}
        <PilotDock />
      </AppShell>
    </SessionProvider>
  );
}
