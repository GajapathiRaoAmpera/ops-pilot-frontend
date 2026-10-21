// MOCK DATA: static UI-preview data, not from any backend.
// No automation/runbook endpoint is specified yet; replace with a verified API service once a contract exists.
import type { ActiveJob, AutomationSummary, JobRun, Runbook } from "./types";

export const MOCK_SUMMARY: AutomationSummary[] = [
  { label: "Active workers", value: "12", chip: "100% ONLINE", sub: "Kubernetes Runner Pool (East/West)" },
  { label: "Jobs in flight", value: "03", chip: "2 AUTOPILOT", sub: "#JOB-8812 consuming highest I/O" },
  { label: "24h success rate", value: "98.2%", chip: "+0.4%", sub: "1,420 orchestrations completed" },
  { label: "Avg run duration", value: "1m 45s", chip: "-14s P95", sub: "Telemetry weighted over 48 clusters" },
];

/** Tab labels as shown in the mock-up. Counts are static mock labels, not computed. */
export const MOCK_CATEGORY_COUNTS = { All: 18, K8s: 7, Database: 4, Security: 4, Ingress: 3 } as const;

export const MOCK_RUNBOOKS: Runbook[] = [
  { id: "RB-0104", category: "K8s", title: "Zero-Downtime Rolling Restart", description: "Executes ordered pod replenishment, progressive readiness checks, max-unavailable cap strictly locked at 10%.", target: "pods/api-gw-prod", estimate: "2m 10s" },
  { id: "RB-0220", category: "Database", title: "Scale-Out Read Replica", description: "Aurora PostgreSQL auto-provisioning instance pool and register target group via Terraform provider dynamically.", target: "rds-main-aurora-cluster", estimate: "4m 50s" },
  { id: "RB-0331", category: "Ingress", title: "SSL/TLS Certificate Rotation", description: "Automated ACME renewal, SAN validation challenge, and hot-reload of Envoy proxy certificates.", target: "cert-manager / envoy-gw", estimate: "45s" },
  { id: "RB-0412", category: "Security", title: "Emergency Traffic Drain & Failover", description: "Cloudflare and Route53 DNS shift, sheds edge ingress connection pool, redirects active traffic to standby regional cluster.", target: "prod-us-east-1 -> us-east-2", estimate: "3m 00s", highImpact: true, runningNow: true },
  { id: "RB-0118", category: "K8s", title: "Kubelet Node Cordon & Drain", description: "Cordons the node, evicts pods respecting PodDisruptionBudgets, and waits for rescheduling.", target: "node-pool-spot-ap-southeast", estimate: "6m 00s" },
  { id: "RB-0127", category: "K8s", title: "HPA Threshold Tuning", description: "Adjusts HPA min/max replicas and CPU target for a deployment with a dry-run diff first.", target: "deploy/checkout-svc", estimate: "1m 30s" },
  { id: "RB-0235", category: "Database", title: "Automated Snapshot & Restore Test", description: "Takes a cluster snapshot, restores to an isolated instance and runs integrity checks.", target: "db-aurora-prod", estimate: "12m 00s" },
  { id: "RB-0510", category: "Security", title: "Rotate Service Account Credentials", description: "Rotates workload identity credentials and restarts dependent pods in sequence.", target: "ns/payments", estimate: "2m 40s" },
  { id: "RB-0338", category: "Ingress", title: "WAF Rule Rollout", description: "Stages a WAF rule set in count mode, then promotes to block after the observation window.", target: "edge-waf-global", estimate: "5m 20s" },
  { id: "RB-0341", category: "Ingress", title: "Ingress Controller Upgrade", description: "Canary upgrade of ingress-nginx controllers with traffic-weighted rollback gates.", target: "ingress-nginx / default", estimate: "8m 15s" },
];

export const MOCK_ACTIVE_JOB: ActiveJob = {
  ref: "JOB-8812",
  runbook: "K8s Ingress Failover (us-east-1 -> us-east-2)",
  environment: "prod-us-east-1 -> us-east-2",
  triggeredBy: "D. Vance",
  status: "running",
  duration: "1m 14s",
  executedAt: "Just now",
  stages: [
    { name: "Drain conn.", status: "succeeded", detail: "18s" },
    { name: "Standby pods", status: "succeeded", detail: "32s" },
    { name: "Route53 weights", status: "running", detail: "In flight" },
    { name: "Warm cache", status: "queued", detail: "Queued" },
    { name: "Health verify", status: "queued", detail: "Queued" },
  ],
  log: [
    { t: "00:01", text: "[EXEC] Initializing orchestrator runner pool 'runner-east-04' with policy SEC-AUTOPILOT-409." },
    { t: "00:04", text: "[INFO] Loaded manifest: /etc/runbooks/prod/failover-cluster-weights.yaml" },
    { t: "00:12", text: "[STAGE 1] Invoking 'connection-drain' hook on ingress-nginx controllers in namespace default..." },
    { t: "00:25", text: "[INFO] Existing in-flight TCP sessions: 14,280 down to 12. Active timeout budget: 30s remaining." },
    { t: "00:26", text: "[WARN] Config dump contained token=abc123def456ghi789 (should have been masked upstream)" },
    { t: "00:30", text: "[STAGE 1] Connection drain completed successfully. Exit status: 0." },
    { t: "00:31", text: "[STAGE 2] Deploying standby pods replica set across us-east-2a, us-east-2b (HPA min=30, max=120)." },
    { t: "00:48", text: "[INFO] 30 of 30 replicas passed readiness probe /healthz at HTTP 200 OK." },
    { t: "01:03", text: "[STAGE 2] Target cluster warm-up verified in us-east-2." },
  ],
};

export const MOCK_HISTORY: JobRun[] = [
  { ref: "JOB-8812", runbook: "Emergency Traffic Drain & Failover", environment: "prod-us-east-1 -> east-2", triggeredBy: "D. Vance", status: "running", duration: "1m 14s", executedAt: "Just now" },
  { ref: "JOB-8811", runbook: "SSL/TLS Certificate Rotation (Envoy)", environment: "edge-ingress-fra", triggeredBy: "Autopilot (ACME)", status: "succeeded", duration: "42s", executedAt: "18m ago" },
  { ref: "JOB-8810", runbook: "Zero-Downtime Rolling Restart", environment: "cluster-us-west-k8s", triggeredBy: "A. Rivera", status: "succeeded", duration: "2m 04s", executedAt: "1h 05m ago" },
  { ref: "JOB-8809", runbook: "Scale-Out Read Replica (Aurora PostgreSQL)", environment: "db-aurora-prod", triggeredBy: "S. Kowalski", status: "approval_required", duration: "-", executedAt: "3h 22m ago" },
  { ref: "JOB-8808", runbook: "Kubelet Node Cordon & Drain", environment: "node-pool-spot-ap-southeast", triggeredBy: "SRE Sentinel", status: "timed_out", duration: "10m 00s", executedAt: "5h 41m ago" },
  { ref: "JOB-8807", runbook: "Zero-Downtime Rolling Restart", environment: "cluster-eu-k8s", triggeredBy: "A. Rivera", status: "failed", duration: "1m 12s", executedAt: "6h ago" },
  { ref: "JOB-8806", runbook: "SSL/TLS Certificate Rotation (Envoy)", environment: "edge-ingress-iad", triggeredBy: "D. Vance", status: "cancelled", duration: "9s", executedAt: "7h ago" },
  { ref: "JOB-8805", runbook: "Scale-Out Read Replica (Aurora PostgreSQL)", environment: "db-aurora-staging", triggeredBy: "S. Kowalski", status: "queued", duration: "-", executedAt: "Queued" },
];
