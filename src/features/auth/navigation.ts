import { hasAnyPermission, PERMISSIONS, type Permission } from "./permissions";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  permission: Permission;
  /** Additional permissions that also unlock this entry (any-of). */
  alsoAllow?: readonly Permission[];
  section: "Platform" | "Dashboards & Operations" | "AI & Incidents" | "Governance & Security" | "Settings";
}

/** Single source of truth for sidebar entries AND route protection. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/platform", label: "Organizations", icon: "domain", permission: PERMISSIONS.platformOrgs, section: "Platform" },
  { href: "/overview", label: "Overview Command Center", icon: "terminal", permission: PERMISSIONS.overviewRead, section: "Dashboards & Operations" },
  { href: "/pipelines", label: "CI/CD Pipelines", icon: "alt_route", permission: PERMISSIONS.pipelinesRead, section: "Dashboards & Operations" },
  { href: "/automation", label: "Automation Center", icon: "smart_toy", permission: PERMISSIONS.automationRead, section: "Dashboards & Operations" },
  { href: "/copilot", label: "OpsPilot AI Copilot", icon: "auto_awesome", permission: PERMISSIONS.copilotUse, section: "AI & Incidents" },
  { href: "/approvals", label: "Approvals Inbox", icon: "inbox", permission: PERMISSIONS.approvalsRead, section: "Governance & Security" },
  { href: "/team", label: "Team & Access", icon: "group_add", permission: PERMISSIONS.membersManage, alsoAllow: [PERMISSIONS.wsMembersManage], section: "Governance & Security" },
  { href: "/rbac", label: "RBAC & Permission Matrix", icon: "admin_panel_settings", permission: PERMISSIONS.rbacRead, section: "Governance & Security" },
  { href: "/audit", label: "Audit Trail & Compliance", icon: "fact_check", permission: PERMISSIONS.auditRead, section: "Governance & Security" },
  { href: "/settings", label: "Workspace Settings", icon: "settings", permission: PERMISSIONS.settingsRead, section: "Settings" },
];

export function visibleNavItems(granted: readonly string[]): NavItem[] {
  return NAV_ITEMS.filter((item) => hasAnyPermission(granted, [item.permission, ...(item.alsoAllow ?? [])]));
}

/** First authorised destination, or null when the user may open nothing. */
export function landingPath(granted: readonly string[]): string | null {
  return visibleNavItems(granted)[0]?.href ?? null;
}

export function permissionForPath(pathname: string): Permission | undefined {
  return NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))?.permission;
}

/** Accepts only same-origin relative paths; blocks open redirects. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  if (next.startsWith("/login") || next.startsWith("/api")) return null;
  return next;
}
