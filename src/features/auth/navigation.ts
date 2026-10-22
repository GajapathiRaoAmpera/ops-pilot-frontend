import { hasAnyPermission, PERMISSIONS, type Permission } from "./permissions";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  permission: Permission;
  /** Additional permissions that also unlock this entry (any-of). */
  alsoAllow?: readonly Permission[];
  section: "Platform" | "Operations" | "AI" | "Governance" | "Settings";
}

/** Single source of truth for sidebar entries AND route protection. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/platform", label: "Organizations", icon: "domain", permission: PERMISSIONS.platformOrgs, section: "Platform" },
  { href: "/overview", label: "Overview", icon: "terminal", permission: PERMISSIONS.overviewRead, section: "Operations" },
  { href: "/pipelines", label: "Pipelines", icon: "alt_route", permission: PERMISSIONS.pipelinesRead, section: "Operations" },
  { href: "/automation", label: "Automation", icon: "smart_toy", permission: PERMISSIONS.automationRead, section: "Operations" },
  { href: "/cloud", label: "Cloud", icon: "cloud", permission: PERMISSIONS.cloudManage, section: "Operations" },
  { href: "/copilot", label: "AI Copilot", icon: "auto_awesome", permission: PERMISSIONS.copilotUse, section: "AI" },
  { href: "/approvals", label: "Approvals", icon: "inbox", permission: PERMISSIONS.approvalsRead, section: "Governance" },
  { href: "/team", label: "Team & access", icon: "group_add", permission: PERMISSIONS.membersManage, alsoAllow: [PERMISSIONS.wsMembersManage], section: "Governance" },
  { href: "/rbac", label: "Roles & permissions", icon: "admin_panel_settings", permission: PERMISSIONS.rbacRead, section: "Governance" },
  { href: "/audit", label: "Audit trail", icon: "fact_check", permission: PERMISSIONS.auditRead, section: "Governance" },
  { href: "/settings", label: "Settings", icon: "settings", permission: PERMISSIONS.integrationsManage, section: "Settings" },
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
