import type { ReactNode } from "react";
import { Sidebar } from "../Sidebar/Sidebar";
import styles from "./AppShell.module.scss";

interface Props {
  organizationName: string;
  organization?: ReactNode;
  userName: string;
  userRole: string;
  /** Slots keep this shell free of auth/permission logic. */
  nav: ReactNode;
  accountActions: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
}

export function AppShell({ organizationName, organization, userName, userRole, nav, accountActions, banner, children }: Props) {
  return (
    <>
      <a href="#main" className={styles.skip}>Skip to main content</a>
      {banner}
      <div className={styles.shell}>
        <Sidebar organizationName={organizationName} organization={organization} userName={userName} userRole={userRole} nav={nav} accountActions={accountActions} />
        <main id="main" className={styles.content}>{children}</main>
      </div>
    </>
  );
}
