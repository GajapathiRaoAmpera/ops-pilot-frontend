export type Severity = "critical" | "warning" | "info";
export type ActionType = "deploy" | "rbac" | "secret" | "rollback" | "telemetry";
export type AuditResult = "success" | "denied";

/** Mock-only shape. No backend audit endpoint has been verified yet. */
export interface AuditEvent {
  id: string;
  timestamp: string;
  correlationId: string;
  actor: string;
  actorRole: string;
  resource: string;
  action: ActionType;
  target: string;
  org: string;
  env: string;
  severity: Severity;
  authMethod: string;
  result: AuditResult;
  detail: string;
  /** Mock age in hours, used by the date-range filter. */
  ageHours: number;
  /** Mock before/after state, shown as plain text. */
  diff?: { before: string; after: string };
}

export interface AuditFilters {
  search: string;
  org: string;
  env: string;
  severity: string;
  action: string;
  range: string;
}

export const ALL = "all";
