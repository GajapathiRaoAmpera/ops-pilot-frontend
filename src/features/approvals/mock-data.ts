// MOCK DATA: static UI-preview data, not from any backend.
import type { ApprovalRequest } from "./types";

export const MOCK_APPROVALS: readonly ApprovalRequest[] = [
  {
    id: "REQ-8021",
    title: "Emergency Canary Rollback of checkout-api",
    severityRank: 2,
    severityLabel: "SEV-2 CRITICAL",
    risk: "high",
    requester: "SRE Sentinel on behalf of David Vance",
    ageMinutes: 12,
    ageLabel: "12m ago",
    ttlLabel: "18m 22s",
    target: "prod-primary-us-east",
    signedCount: 1,
    requiredCount: 2,
    policy:
      "Policy Enforcement Rule #204: Dual-Signoff Required. Initiator cannot approve self-requested mutations. Requires at least 1 DevOps Lead and 1 Org Admin signature prior to execution release.",
    signoffs: [
      { slot: "Key 1: DevOps Lead", role: "DevOps Lead", state: "recorded", who: "Alex Rivera (SecOps Admin)", detail: "mock key 0x7F41...982B", note: "Mock note: HTTP 502 rates increased after canary rollout." },
      { slot: "Key 2: Org Admin", role: "Org Admin", state: "awaiting", who: "Admin keypair", detail: "Mock label: hardware key / WebAuthn signature would be requested here" },
    ],
    blast: {
      metrics: [
        { label: "Target Pods", value: "48 / 48", sub: "100% canary replaced" },
        { label: "Federated Services", value: "18 Nodes", sub: "Downstream mesh" },
        { label: "Live User Sessions", value: "~2,480", sub: "Mock estimate" },
        { label: "Clusters Impacted", value: "4 Regions", sub: "US-E, US-W, EU, AP" },
      ],
      caption: "Mock traffic weight: 15% to 0% canary. Canary v2.14.9-rc3 (failing), restore target v2.14.8-stable.",
    },
    changeFile: "deployments/k8s/checkout-api/values.production.yaml",
    changeLines: [
      { kind: "context", text: "  spec:" },
      { kind: "context", text: "    replicas: 48" },
      { kind: "remove", text: "    image: checkout:v2.14.9-rc3" },
      { kind: "add", text: "    image: checkout:v2.14.8-stable" },
      { kind: "remove", text: "    ENABLE_PAYMENT_V3_ENCRYPTION_ASYNC: \"true\"" },
      { kind: "add", text: "    ENABLE_PAYMENT_V3_ENCRYPTION_ASYNC: \"false\"" },
    ],
  },
  {
    id: "REQ-8019",
    title: "Production IAM AssumeRole for Data Migration",
    severityRank: 3,
    severityLabel: "SEV-3",
    risk: "medium",
    requester: "Sarah Chen",
    ageMinutes: 42,
    ageLabel: "42m ago",
    ttlLabel: "4h 00m",
    target: "role/DataWarehouseReplica",
    signedCount: 0,
    requiredCount: 2,
    policy: "Dual sign-off required for production role assumption.",
    signoffs: [
      { slot: "Key 1: DevOps Lead", role: "DevOps Lead", state: "awaiting" },
      { slot: "Key 2: Org Admin", role: "Org Admin", state: "awaiting" },
    ],
    changeLines: [],
  },
  {
    id: "REQ-8014",
    title: "Scale-Out Redis Cluster (Replica count +4)",
    severityRank: 4,
    severityLabel: "SEV-4",
    risk: "low",
    requester: "Jenkins Bot",
    ageMinutes: 120,
    ageLabel: "2h ago",
    ttlLabel: "Auto-queue",
    target: "cache-redis-v6.eu-west",
    signedCount: 1,
    requiredCount: 1,
    policy: "Single approver required.",
    signoffs: [{ slot: "Key 1: DevOps Lead", role: "DevOps Lead", state: "awaiting" }],
    changeLines: [
      { kind: "remove", text: "  replicas: 2" },
      { kind: "add", text: "  replicas: 6" },
    ],
  },
];

export const MOCK_SLA = { avgResponse: "8.4m", threshold: "30m", percent: 28 };
