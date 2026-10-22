import { hasAnyPermission, PERMISSIONS, type Permission } from "./permissions";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  /** One sentence on what the page is for, shown in the sidebar's "i" card. */
  description: string;
  permission: Permission;
  /** Additional permissions that also unlock this entry (any-of). */
  alsoAllow?: readonly Permission[];
  section: "Platform" | "Operations" | "AI" | "Governance" | "Settings";
}

/** Single source of truth for sidebar entries AND route protection. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/platform", label: "Organizations", icon: "domain", description: "Create organizations, block or delete them, and manage the people in each one.", permission: PERMISSIONS.platformOrgs, section: "Platform" },
  { href: "/overview", label: "Overview", icon: "terminal", description: "A live snapshot of this workspace: recent pipeline runs, requests waiting for a decision, and recent activity.", permission: PERMISSIONS.overviewRead, section: "Operations" },
  { href: "/pipelines", label: "Pipelines", icon: "alt_route", description: "GitHub Actions runs from every connected repository. Sync to refresh, and request a re-run of a failed run.", permission: PERMISSIONS.pipelinesRead, section: "Operations" },
  { href: "/automation", label: "Automation", icon: "smart_toy", description: "The actions OpsPilot can take for you, each needing a second person's approval, and a history of every run.", permission: PERMISSIONS.automationRead, section: "Operations" },
  { href: "/cloud", label: "Cloud", icon: "cloud", description: "Connect a Google Cloud project read-only and browse what is running in it.", permission: PERMISSIONS.cloudManage, section: "Operations" },
  { href: "/copilot", label: "AI Copilot", icon: "auto_awesome", description: "Pick a failed run: the AI reads its log, explains what went wrong, and can propose a fix as a pull request.", permission: PERMISSIONS.copilotUse, alsoAllow: [PERMISSIONS.aiRead], section: "AI" },
  { href: "/approvals", label: "Approvals", icon: "inbox", description: "Requests waiting for a decision. Nothing runs until someone other than the requester approves it.", permission: PERMISSIONS.approvalsRead, section: "Governance" },
  { href: "/team", label: "Team & access", icon: "group_add", description: "Invite people, set their role for the whole organization or one workspace, and block or remove access.", permission: PERMISSIONS.membersManage, alsoAllow: [PERMISSIONS.wsMembersManage], section: "Governance" },
  { href: "/rbac", label: "Roles & permissions", icon: "admin_panel_settings", description: "What each role is allowed to do. The server checks this on every request.", permission: PERMISSIONS.rbacRead, section: "Governance" },
  { href: "/audit", label: "Audit trail", icon: "fact_check", description: "A record of every sign-in, change, approval and AI investigation, newest first.", permission: PERMISSIONS.auditRead, alsoAllow: [PERMISSIONS.wsAuditRead], section: "Governance" },
  { href: "/settings", label: "Settings", icon: "settings", description: "Connect GitHub for this workspace so OpsPilot can read runs and open fix pull requests.", permission: PERMISSIONS.integrationsManage, section: "Settings" },
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
