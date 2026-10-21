// MOCK DATA: static UI-preview data, not from any backend.
import type { CloudEndpoint, LogLine, Pipeline, WizardStep } from "./types";

export const MOCK_WIZARD_STEPS: WizardStep[] = [
  { n: "01", title: "Select Provider", description: "AWS, GCP, Azure, or Private OpenShift endpoint topology.", stateLabel: "STATE: AWS SELECTED", icon: "check_circle", tone: "done" },
  { n: "02", title: "Scope & Tenant", description: "Define organization hierarchy, accounts, and VPC subnets.", stateLabel: "IN_CONFIGURATION", icon: "radio_button_checked", tone: "active" },
  { n: "03", title: "IAM Federation", description: "Exchange OIDC trust token & cross-account AssumeRole.", stateLabel: "PENDING INPUT", icon: "key", tone: "pending" },
  { n: "04", title: "Policy Permissions", description: "Scope-down zero-trust read/deploy guardrails and RBAC.", stateLabel: "READ_ONLY DEFAULT", icon: "security", tone: "pending" },
  { n: "05", title: "Verification Probe", description: "Handshake latency test, synthetic telemetry health poll.", stateLabel: "IDLE", icon: "satellite_alt", tone: "pending" },
];

export const MOCK_CLOUD_ENDPOINTS: CloudEndpoint[] = [
  {
    id: "aws-prod", provider: "aws", name: "AWS Production Platform", slug: "acme-corp-infra-prod", icon: "cloud_queue",
    environment: "production", state: "connected", stateLabel: "Connected",
    rows: [
      { label: "Account ID", value: "4910-2391-0021" },
      { label: "Discovered res.", value: "142", hint: "(EKS, RDS, S3)", emphasis: true },
      { label: "Auth type", value: "AssumeRole (2m ago)" },
      { label: "Telemetry RTT", value: "18ms" },
    ],
    latencyBars: [4, 5, 3, 6, 4, 4], latencyLabel: "STABLE",
    region: "us-east-1 // us-east-2", regionIcon: "verified_user", footerActionLabel: "Configure VPC",
  },
  {
    id: "gcp-core", provider: "gcp", name: "GCP Core Infrastructure", slug: "us-central1-mesh", icon: "deployed_code",
    environment: "production", state: "connected", stateLabel: "Connected",
    rows: [
      { label: "Project ID", value: "acme-prod-kubernetes" },
      { label: "Discovered res.", value: "88", hint: "(GKE Auto, SQL)", emphasis: true },
      { label: "Auth type", value: "Workload Identity Fed" },
      { label: "Telemetry RTT", value: "24ms" },
    ],
    latencyBars: [5, 4, 5, 6, 5, 4], latencyLabel: "STABLE",
    region: "us-central1-c", regionIcon: "domain_verification", footerActionLabel: "Audit Roles",
  },
  {
    id: "azure-hub", provider: "azure", name: "Azure Engineering Hub", slug: "eu-west-enterprise", icon: "grid_view",
    environment: "production", state: "renewal", stateLabel: "Renewal 4h",
    rows: [
      { label: "Subscription ID", value: "sub-9821-az" },
      { label: "Discovered res.", value: "54", hint: "(AKS, Cosmos DB)", emphasis: true },
      { label: "Auth type", value: "Service Principal" },
      { label: "Security warning", value: "Expiring Cert" },
    ],
    warning: { text: "Auto-rotation stalled", actionLabel: "Renew Token" },
    region: "westeurope", regionIcon: "dns", footerActionLabel: "Inspect Sub",
  },
];

export const MOCK_PIPELINES: Pipeline[] = [
  {
    id: "p1", name: "api-gateway", track: "track-release-v2.8.4", ref: "main", commit: "git:9a8f2c1",
    target: "us-east-eks-cluster-01", targetIcon: "cloud", environment: "production", status: "running",
    progress: 40, progressLabel: "Canary Rollout 40%", progressSide: "Stage 4/5", stageSummary: "Build > Unit > E2E > Canary (40%)",
    elapsed: "4m 12s", actions: [{ label: "Live Logs", kind: "neutral" }, { label: "Promote 100%", kind: "primary" }],
  },
  {
    id: "p2", name: "checkout-engine", track: "order-tax-calculator", ref: "pr-421", commit: "git:c842b10",
    target: "staging-mesh", targetIcon: "hub", environment: "staging", status: "succeeded",
    progress: 100, progressLabel: "412 tests passed", progressSide: "Done", stageSummary: "100% Traffic Shift Complete",
    elapsed: "2m 04s", actions: [{ label: "View Artifacts", kind: "neutral" }],
  },
  {
    id: "p3", name: "telemetry-gateway", track: "collector-agent-sync", ref: "v4.0.1", commit: "git:f1d24a9",
    target: "gcp-central-telemetry", targetIcon: "warning", environment: "production", status: "degraded",
    progress: 40, progressLabel: "Step 2/5 CrashLoop", progressSide: "HALTED", stageSummary: "Pod exit code 137 (OOMKilled)",
    elapsed: "1m 45s", actions: [{ label: "Debug", kind: "neutral" }, { label: "Rollback", kind: "danger" }],
  },
];

export const MOCK_LOG_LINES: LogLine[] = [
  { time: "14:38:01.012", level: "info", text: "[mesh-sync] Cloud IAM token validation successful for aws-prod-role-assume." },
  { time: "14:38:04.428", level: "info", text: "[canary-engine] Route split applied: 40% traffic shifted to pod/api-gateway-v2-8-4-8b92." },
  { time: "14:38:09.110", level: "info", text: "[sre-sentinel] p99 latency metric observed at 14.2ms. Under threshold of 45ms." },
  { time: "14:38:11.890", level: "error", text: "[k8s-pod-event] Pod telemetry-gateway-deploy-cf71 OOMKilled - Memory limit exceeded (512Mi)." },
  { time: "14:38:12.001", level: "info", text: "[ai-ops-copilot] Remediation suggested: Adjust memory request to 1024Mi and trigger patch." },
];

export const MOCK_THROUGHPUT = { value: "1.84", unit: "GB/s", note: "Active cross-cloud mirror across 12 EKS & GKE node pools.", cadence: "30s CONTINUOUS" };
