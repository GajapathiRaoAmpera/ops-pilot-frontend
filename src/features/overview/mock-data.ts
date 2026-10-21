// MOCK DATA: static UI-preview data, not from any backend.
import type { MockOverview } from "./types";

export const MOCK_OVERVIEW: MockOverview = {
  workspace: {
    org: "Acme Corp Global",
    environment: "production-us-east",
    summary: ["All Systems Operational", "3 Multi-Clouds Synced", "Dual-Key SOX Active"],
  },
  sparkline: [
    { day: "Mon", rate: 98.8 }, { day: "Tue", rate: 99.1 }, { day: "Wed", rate: 98.9 }, { day: "Thu", rate: 99.4 },
    { day: "Fri", rate: 99.0 }, { day: "Sat", rate: 99.6 }, { day: "Sun", rate: 99.8 },
  ],
  pipelines: [
    {
      id: "checkout-api", service: "checkout-api", version: "v3.42.0-rc2", commit: "git:9a8f2c1", target: "prod-primary-us-east",
      stageLabel: "Canary 40%", stageDetail: "4/10 Pods", progress: 40, health: "stable", healthLabel: "99.8% OK",
      actions: [{ label: "Logs", kind: "view" }, { label: "Promote", kind: "mutate" }],
    },
    {
      id: "auth-token-broker", service: "auth-token-broker", version: "v1.18.9", commit: "git:c4e07b2", target: "multi-region-auth",
      stageLabel: "E2E Smoke Tests", stageDetail: "88%", progress: 88, health: "verifying", healthLabel: "Verifying",
      actions: [{ label: "Logs", kind: "view" }, { label: "Cancel", kind: "mutate" }],
    },
    {
      id: "telemetry-gateway", service: "telemetry-gateway", version: "v4.0.1", commit: "git:f1d24a9", target: "gcp-central-telemetry",
      stageLabel: "Paused (CrashLoop)", stageDetail: "Step 2/5", progress: 40, health: "degraded", healthLabel: "Degraded",
      actions: [{ label: "Debug", kind: "view" }, { label: "Rollback", kind: "mutate" }],
    },
    {
      id: "payments-event-bus", service: "payments-event-bus", version: "v8.2.1", commit: "git:33e8b09", target: "aws-us-east-1",
      stageLabel: "Fully Synced", stageDetail: "100%", progress: 100, health: "stable", healthLabel: "Active Stable",
      actions: [{ label: "Audit", kind: "view" }],
    },
  ],
  logs: [
    { time: "14:41:02.102", source: "MESH-CONTROL", level: "info", message: "Handshake confirmed with envoy-edge-proxy [10.244.18.91:8443]. Latency weight: 1.2ms." },
    { time: "14:41:02.418", source: "HEALTH-PROBE", level: "info", message: "GET /healthz/deep on checkout-api cluster replica-4 -> 200 OK (response: 18ms)." },
    { time: "14:41:03.011", source: "DNS-SYNC", level: "info", message: "CoreDNS route tables propagated to 16 edge locations. TTL: 60s." },
    { time: "14:41:03.882", source: "KUBE-ORCH", level: "info", message: "AdmissionController granted Canary traffic weight bump from 30% -> 40%." },
    { time: "14:41:04.119", source: "WARN [checkout-api-pod-9c]", level: "warn", message: "cgroup memory saturation at 84.8%. GC throttling detected (pause: 210ms)." },
    { time: "14:41:04.992", source: "PROMETHEUS", level: "info", message: "Ingestion pipeline evaluated 4,200 metric samples / sec. Error budget remaining: 99.42%." },
    { time: "14:41:05.412", source: "OPSPILOT-AI", level: "info", message: "Sentinel correlation engine pinned memory leak vector to redis-session-pool leak in v3.42.0-rc2." },
  ],
  streamFooter: ["CLUSTER: prod-us-east-k8s", "NAMESPACE: acme-commerce", "ENC: TLSv1.3 ECDHE", "STREAM BUFFER: 98.4 KB / 1.0 MB"],
};
