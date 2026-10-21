export type ProviderKind = "aws" | "gcp" | "azure";
export type EnvironmentName = "production" | "staging";
export type ConnectionState = "connected" | "renewal";

export interface CloudMetaRow {
  label: string;
  value: string;
  /** Secondary muted text next to the value, e.g. resource kinds. */
  hint?: string;
  /** Whether the value is a count of discovered resources. */
  emphasis?: boolean;
}

export interface CloudEndpoint {
  id: string;
  provider: ProviderKind;
  name: string;
  slug: string;
  icon: string;
  environment: EnvironmentName;
  state: ConnectionState;
  /** Visible status text, e.g. "Connected" or "Renewal 4h". */
  stateLabel: string;
  rows: CloudMetaRow[];
  /** Relative bar heights (1-6) for the latency mini chart; absent when no telemetry. */
  latencyBars?: number[];
  latencyLabel?: string;
  warning?: { text: string; actionLabel: string };
  region: string;
  regionIcon: string;
  footerActionLabel: string;
}

export type PipelineStatus = "running" | "queued" | "succeeded" | "degraded";

export interface Pipeline {
  id: string;
  name: string;
  track: string;
  ref: string;
  commit: string;
  target: string;
  targetIcon: string;
  environment: EnvironmentName;
  status: PipelineStatus;
  /** 0-100 */
  progress: number;
  progressLabel: string;
  progressSide: string;
  stageSummary: string;
  elapsed: string;
  actions: { label: string; kind: "neutral" | "primary" | "danger" }[];
}

export interface WizardStep {
  n: string;
  title: string;
  description: string;
  stateLabel: string;
  icon: string;
  tone: "done" | "active" | "pending";
}

export interface LogLine {
  time: string;
  text: string;
  level: "info" | "error";
}
