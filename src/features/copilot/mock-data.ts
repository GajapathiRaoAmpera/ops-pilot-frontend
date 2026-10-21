// MOCK DATA: static UI-preview data, not from any backend.
import type { ChatMessage, InvestigationStep, Mitigation, TelemetryMetric } from "./types";

export const incident = {
  id: "INC-409",
  severity: "SEV-1 Critical",
  title: "Memory Saturation & Latency Spike on",
  resource: "checkout-api-pod-3",
  scope: "(prod-primary-us-east)",
  elapsed: "Elapsed: 26m 42s",
  triage: "Auto-Triage Complete",
};

export const telemetry: TelemetryMetric[] = [
  { id: "latency", label: "P99 API latency", value: "1,840", unit: "ms", badge: "+4088%", detail: "Baseline: 45ms",
    spark: "0,35 30,34 60,36 90,33 110,32 130,35 145,28 155,12 165,4 180,2 200,3" },
  { id: "memory", label: "Memory saturation", value: "98.4", unit: "%", badge: "Near OOM", detail: "3.94 GB / 4.00 GB", percent: 98.4 },
  { id: "connections", label: "Active DB connections", value: "492", unit: " / 500", badge: "db-read-02", detail: "98.4% Pool Cap", percent: 98.4 },
];

export const podDetails = [
  { k: "Image", v: "checkout-service:v2.19.4-rc2" },
  { k: "Node", v: "ip-10-0-142-88.ec2.internal" },
  { k: "Cgroup limit", v: "4096Mi / 2.0 CPU" },
];

export const investigationSteps: InvestigationStep[] = [
  { title: "Prometheus Metrics Correlation", time: "14:02:18 UTC",
    body: "Aggregated cross-namespace metrics across k8s-pod-network and RDS telemetry. Detected pool exhaustion on connection pool pg-pool-read-02, triggered by long-running sequential table scans.",
    confidence: "Confidence: 99.4% - Correlated 142k datapoints" },
  { title: "Git Diff & Commit Attribution", time: "14:03:05 UTC",
    body: "Automated blame parser matched deploy delta in release v2.19.4-rc2. Pinned commit git:f810e4a (\"feat(orders): add multi-currency ledger join\").",
    diff: { file: "models/ledger.py (lines 84-88)",
      removed: "- SELECT * FROM orders JOIN transactions ON orders.cust_id = transactions.cust_id",
      added: "+ SELECT * FROM orders INNER JOIN transactions USING (uuid) /* missing composite index */" } },
];

export const mitigations: Mitigation[] = [
  { key: "A", title: "Temporary Scale-Out of Read Replicas", summary: "Add +2 replica pods to absorb join pressure",
    risk: "low", score: 12, meta: ["ETA: ~90s", "Cost Impact: +$0.18/hr"] },
  { key: "B", title: "Apply PgBouncer Connection Throttling", summary: "Clamp incoming requests to 120 req/s with circuit breaker",
    risk: "medium", score: 44, meta: ["ETA: Instant", "Degradation: 429s on 6% users"] },
  { key: "C", title: "Canary Rollback to commit git:9c33bb1", summary: "Revert image tags across 14 services & reload env secrets",
    risk: "high", score: 89, meta: ["Requires Org Admin Dual-Authorization"], needsApproval: true },
];

export const transcript: ChatMessage[] = [
  { who: "user", name: "Alex Rivera", time: "14:02:40",
    text: "Show me which specific connection pool is saturated and evaluate if scaling replicas will prevent an OOM crash on pod-3." },
  { who: "ai", name: "OpsPilot Copilot", time: "14:02:43",
    text: "AI suggestion: pool pg-pool-read-02 is operating at 492/500 connections. Option A (Scale-out +2 pods) may redistribute query load across 5 replicas instead of 3; projected memory pressure drop from 98.4% to ~61% within 45 seconds of pod ready state. This is a projection, not a measured result.",
    tools: [
      { label: "Querying Datadog APM metrics...", result: "200 OK" },
      { label: "Inspecting cgroup memory limit...", result: "98.4% CAP" },
      { label: "Checking RBAC guardrail policy...", result: "ALLOWED" },
    ] },
];

export const suggestedQueries = ["Explain root cause in detail", "Draft approval request for Org Admin", "Simulate blast radius of Limit"];
