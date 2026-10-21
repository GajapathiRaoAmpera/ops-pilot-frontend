import type { ReactNode } from "react";
import styles from "./AppShell.module.scss";

interface Props {
  organizationName: string;
  userName: string;
  userRole: string;
  /** Slots keep this shell free of auth/permission logic. */
  nav: ReactNode;
  accountActions: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
}

export function AppShell({ organizationName, userName, userRole, nav, accountActions, banner, children }: Props) {
  return (
    <>
      {banner}
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brandRow}>
            <span className={styles.logo} aria-hidden="true">O</span>
            OpsPilot
          </div>
          <div className={styles.org}>
            <p className={styles.orgLabel}>Organization</p>
            <p className={styles.orgName}>{organizationName}</p>
          </div>
          <div className={styles.nav}>{nav}</div>
          <div className={styles.account}>
            <p className={styles.userName}>{userName}</p>
            <p className={styles.userRole}>{userRole}</p>
            {accountActions}
          </div>
        </aside>
        <main id="main" className={styles.content}>{children}</main>
      </div>
    </>
  );
}
