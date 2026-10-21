/**
 * Centralised permission model. Identifiers follow the `domain:resource:action`
 * style shown in the Stitch RBAC matrix. UNVERIFIED until the backend defines them.
 * Frontend checks only shape the UX; the backend enforces every operation.
 */
export const PERMISSIONS = {
  overviewRead: "sys:overview:read",
  pipelinesRead: "cicd:pipelines:read",
  pipelinesExecute: "cicd:pipelines:execute",
  automationRead: "auto:runbooks:read",
  copilotUse: "ai:copilot:use",
  approvalsRead: "approvals:requests:read",
  approvalsDecide: "approvals:requests:approve",
  rbacRead: "sys:rbac:read",
  auditRead: "sec:telemetry:audit",
  settingsRead: "sys:settings:read",
  membersManage: "sys:members:manage",
  wsMembersManage: "ws:members:manage",
  platformOrgs: "platform:orgs:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Deny by default: missing or malformed permission data grants nothing. */
export function hasPermission(
  granted: readonly string[] | undefined | null,
  required: string,
): boolean {
  return Array.isArray(granted) && granted.includes(required);
}

export function hasAnyPermission(granted: readonly string[] | undefined | null, required: readonly string[]): boolean {
  return required.some((r) => hasPermission(granted, r));
}
