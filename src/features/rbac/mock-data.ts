// MOCK DATA: static UI-preview data, not from any backend.
import type { MockResourceRow, MockRole } from "./types";

/**
 * MOCK display data copied from the Stitch RBAC screen. It is NOT a permission source:
 * never import it from authorization logic. Real role/permission mappings come from the backend.
 */
export const MOCK_ROLES: readonly MockRole[] = [
  { name: "Platform Administrator", assignees: 3 },
  { name: "Organization Administrator", assignees: 8 },
  { name: "Workspace Administrator", assignees: 14 },
  { name: "DevOps Engineer", assignees: 38 },
  { name: "Developer", assignees: 112 },
  { name: "Security Auditor", assignees: 6, readOnly: true },
  { name: "Viewer", assignees: 45 },
];

export const MOCK_DEVOPS_ROLE = {
  name: "DevOps Engineer",
  idLabel: "role_devops_eng_v2",
  description:
    "Grants infrastructure deployment, telemetry inspection, runbook execution, and incident investigation. Production rollbacks and destructive actions mandate Dual-Key Org Admin approval.",
  assignees: 38,
  meshes: 4,
  mfa: "Required",
  maxSession: "8h 00m",
};

export const MOCK_MATRIX: readonly MockResourceRow[] = [
  { name: "Organizations & Workspaces", id: "sys:org:workspaces", icon: "domain", read: "yes", create: "no", update: "no", delete: "no", execute: "na", approve: "na", scope: "Assigned Workspaces Only", conditions: "Inherited base template: Base-Engineer-v1" },
  { name: "Cloud Provider Connections (AWS, GCP, Azure)", id: "infra:cloud:connectors", icon: "cloud_sync", read: "yes", create: "no", update: "no", delete: "no", execute: { label: "Test Conn" }, approve: "na", scope: "production-*, staging-*", conditions: "Connection tests only; no credential reads" },
  { name: "CI/CD Pipelines & Deployments", id: "cicd:pipelines:*", icon: "alt_route", read: "yes", create: "yes", update: "yes", delete: "no", execute: "yes", approve: { label: "Staging Only" }, scope: "All authorized repos", conditions: "Explicit grant on all authorized repos", destructive: true },
  { name: "Automation Runbooks & Scripts", id: "auto:runbooks:exec", icon: "smart_toy", read: "yes", create: "yes", update: "yes", delete: "no", execute: "yes", approve: "na", scope: "Non-destructive auto-allowed", conditions: "Destructive steps require approval", destructive: true },
  { name: "Production Rollback & Failover", id: "infra:emergency:rollback", icon: "history_toggle_off", read: "yes", create: "na", update: "na", delete: "na", execute: { label: "Req Elevation" }, approve: { label: "Dual-Auth required", icon: "gpp_maybe" }, scope: "Dual-Auth Req (2 Signoffs)", conditions: "Target cluster verified before execution", destructive: true, elevated: true },
  { name: "AI Ops Copilot (SRE Sentinel)", id: "ai:copilot:diagnostics", icon: "auto_awesome", read: "yes", create: { label: "Prompts" }, update: "na", delete: "na", execute: { label: "Diagnostics" }, approve: { label: "Locked", icon: "lock" }, scope: "Scoped sandbox tools", conditions: "Sandboxed tools only; suggestions, never executed" },
  { name: "Audit Logs & Compliance Streams", id: "sec:telemetry:audit", icon: "fact_check", read: "yes", create: "na", update: "na", delete: { label: "Immutable" }, execute: "na", approve: "na", scope: "Read-only stream (Workspace only)", conditions: "Immutable; workspace scope only" },
];

export const MOCK_SOD_RULES = [
  { rule: "#101", title: "Anti-Self Approval Enforcement", body: "Deployer cannot approve their own deployment request. Mandates peer review from an authorized engineer in the same workspace.", status: "Strictly enforced", note: "0 exceptions" },
  { rule: "#204", title: "Production Dual-Key Elevation", body: "High-risk mutations in production-us-east require concurrent cryptographic sign-off: 1 DevOps Lead + 1 Organization Admin.", status: "Multi-sig active", note: "Hardware key allowed" },
  { rule: "#312", title: "Temporary JIT Escalation", body: "Just-in-Time emergency root elevation permits a maximum duration of 2 hours. Requires an audited incident ticket reference with auto-reversion.", status: "Max 120 mins", note: "Immutable audit hook" },
] as const;

export const MOCK_SCOPE = {
  tenant: "Acme Corp Global",
  workspace: "production-us-east",
  notes: ["Zero-Trust Protocol Active", "JIT Elevation Mode: Ready"],
};

export const MOCK_MATRIX_META = {
  domainsActive: 7,
  domainsTotal: 24,
  template: "Base-Engineer-v1",
  checksum: "e91b...4ca8",
};

export const MOCK_COMPLIANCE = {
  index: 88,
  text: "Policy conforms to NIST SP 800-207 Zero Trust Architecture with 0 high-risk over-permission warnings.",
  nextAttestation: "In 18 Days (Oct 31)",
};
