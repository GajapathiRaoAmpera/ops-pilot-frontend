"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { BrandMark, BrandWordmark } from "@/components/brand/BrandMark";
import { Icon } from "@/components/ui/Icon/Icon";
import styles from "./Sidebar.module.scss";

const KEY = "opspilot-sidebar-collapsed";
const EVENT = "opspilot-sidebar-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
}
function read(): boolean {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}

interface Props {
  organizationName: string;
  /** Optional replacement for the organization box (e.g. a switcher). */
  organization?: ReactNode;
  userName: string;
  userRole: string;
  nav: ReactNode;
  accountActions: ReactNode;
}

/**
 * Desktop: a toggle between the full sidebar and an icon-only strip, remembered per browser.
 * Phones: the sidebar becomes a top bar whose menu button opens the navigation.
 */
export function Sidebar({ organizationName, organization, userName, userRole, nav, accountActions }: Props) {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);
  const [open, setOpen] = useState(false);

  function toggleCollapsed() {
    try { localStorage.setItem(KEY, collapsed ? "0" : "1"); } catch { /* storage unavailable: not remembered */ }
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <aside className={styles.sidebar} data-collapsed={collapsed} data-open={open}>
      <div className={styles.top}>
        <div className={styles.brandRow}>
          <BrandMark size={28} />
          <span className={styles.hideWhenCollapsed}><BrandWordmark /></span>
        </div>
        <button
          type="button" className={styles.desktopToggle} onClick={toggleCollapsed}
          aria-expanded={!collapsed} aria-controls="app-sidebar-panel"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name={collapsed ? "left_panel_open" : "left_panel_close"} size={20} />
        </button>
        <button
          type="button" className={styles.mobileToggle} onClick={() => setOpen((v) => !v)}
          aria-expanded={open} aria-controls="app-sidebar-panel"
        >
          <Icon name={open ? "close" : "menu"} size={20} />
          Menu
        </button>
      </div>
      <div id="app-sidebar-panel" className={styles.panel}>
        {organization ? <div className={styles.orgSlot}>{organization}</div> : (
          <div className={styles.org}>
            <p className={styles.orgLabel}>Organization</p>
            <p className={styles.orgName} title={organizationName}>{organizationName}</p>
          </div>
        )}
        <div className={styles.nav} onClick={() => setOpen(false)}>{nav}</div>
        <div className={styles.account}>
          <p className={styles.userName} title={userName}>{userName}</p>
          <p className={styles.userRole} title={userRole}>{userRole}</p>
          {accountActions}
        </div>
      </div>
    </aside>
  );
}
