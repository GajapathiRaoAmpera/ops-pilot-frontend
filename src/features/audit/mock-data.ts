// MOCK DATA: static UI-preview data, not from any backend.
import type { AuditEvent } from "./types";

export const MOCK_ORGS = [
  { value: "acme", label: "Acme Corp Global" },
  { value: "emea", label: "Acme EMEA Sub" },
  { value: "apac", label: "Acme APAC Node" },
];

export const MOCK_ENVS = [
  { value: "prod-us", label: "production-us-east" },
  { value: "stg", label: "workspace-stg" },
  { value: "prod-eu", label: "production-eu-west" },
];

export const MOCK_SEVERITIES = [
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
];

export const MOCK_ACTIONS = [
  { value: "deploy", label: "Deploy" },
  { value: "rbac", label: "RBAC Change" },
  { value: "secret", label: "Secret Access" },
  { value: "rollback", label: "Rollback" },
  { value: "telemetry", label: "Telemetry Query" },
];

export const MOCK_EVENTS: AuditEvent[] = [
  { id: "e1", timestamp: "14:04:12.182", correlationId: "corr-8812a", actor: "David Vance", actorRole: "DevOps Lead", resource: "infra:emergency:rollback", action: "rollback", target: "checkout-api", org: "acme", env: "prod-us", severity: "warning", authMethod: "Dual-Auth Signed", result: "success", detail: "Emergency rollback of checkout-api to the previous release.", ageHours: 1, diff: { before: "image: checkout-api:v2.9.1\nreplicas: 6", after: "image: checkout-api:v2.8.7\nreplicas: 6" } },
  { id: "e2", timestamp: "14:01:45.890", correlationId: "corr-8809c", actor: "OpsPilot Copilot", actorRole: "Autonomous Agent", resource: "telemetry:metrics:query", action: "telemetry", target: "prod-db-read-02", org: "acme", env: "prod-us", severity: "info", authMethod: "RBAC Token Scoped", result: "success", detail: "Read-only metrics query issued by an AI agent.", ageHours: 2 },
  { id: "e3", timestamp: "13:45:20.004", correlationId: "corr-8794f", actor: "unauthorized-actor", actorRole: "192.168.4.12", resource: "iam:roles:elevate", action: "rbac", target: "workspace-stg", org: "emea", env: "stg", severity: "critical", authMethod: "Session Expired", result: "denied", detail: "Role elevation attempt was denied.", ageHours: 3 },
  { id: "e4", timestamp: "13:22:11.451", correlationId: "corr-8782b", actor: "Sarah Chen", actorRole: "Org Admin", resource: "iam:roles:update", action: "rbac", target: "team-platform", org: "acme", env: "prod-us", severity: "warning", authMethod: "FIDO2 Hardware Token", result: "success", detail: "Role assignment changed for a team.", ageHours: 30, diff: { before: "team-platform: viewer", after: "team-platform: maintainer" } },
  { id: "e5", timestamp: "12:58:03.317", correlationId: "corr-8771d", actor: "Jenkins CI", actorRole: "Service Account", resource: "pipeline:deploy:release", action: "deploy", target: "api-gateway:v3.42.0", org: "apac", env: "prod-eu", severity: "info", authMethod: "mTLS Certificate", result: "success", detail: "Release deployment triggered by a service account.", ageHours: 100 },
  { id: "e6", timestamp: "12:31:47.920", correlationId: "corr-8760e", actor: "Priya Nair", actorRole: "Security Engineer", resource: "vault:secret:read", action: "secret", target: "payments-db-credentials", org: "acme", env: "prod-eu", severity: "critical", authMethod: "FIDO2 Hardware Token", result: "success", detail: "Secret metadata accessed; secret value is never shown in the UI.", ageHours: 800 },
];

export const RANGES = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];
export const RANGE_HOURS: Record<string, number> = { "24h": 24, "7d": 168, "30d": 720 };

export const MOCK_KPIS = [
  { label: "Total Events (24h)", value: "48,219", sub: "+3.8% | Peak 312 evt/s | 0 dropped" },
  { label: "Privileged Actions", value: "142", sub: "100% MFA | 118 / 142 hardware token (FIDO2)" },
  { label: "Violations Prevented", value: "3", sub: "SoD enforced | Anti-self-approval rule | Last intercept 13:45:20 UTC" },
  { label: "Compliance Health", value: "100%", sub: "SOC-2 Type II, ISO 27001, FedRAMP (mock labels) | Next audit cadence: 18d" },
];

export const MOCK_LEDGER_LABELS = {
  banner: "WORM LEDGER ATTESTED (mock label)",
  merkle: "Merkle Root #0x9bf4..819e (mock value)",
  retention: "7 YRS (WORM ENFORCED) (mock)",
  height: "LEDGER HEIGHT #4,192,801 (mock value)",
  totalEntries: "48,219",
  pages: 965,
};
