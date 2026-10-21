import { AppShell } from "@/components/layout/AppShell/AppShell";
import { PreviewBanner } from "@/components/layout/PreviewBanner/PreviewBanner";
import { LogoutButton } from "@/features/auth/components/LogoutButton/LogoutButton";
import { NavLinks } from "@/features/auth/components/NavLinks/NavLinks";
import { SessionProvider } from "@/features/auth/components/SessionProvider";
import { isGuardBypassed } from "@/features/auth/dev-bypass";
import { requireSession } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <SessionProvider session={session}>
      <AppShell
        organizationName={session.organization.name}
        userName={session.user.name}
        userRole={session.role}
        nav={<NavLinks />}
        accountActions={<LogoutButton />}
        banner={isGuardBypassed() ? <PreviewBanner /> : undefined}
      >
        {children}
      </AppShell>
    </SessionProvider>
  );
}
