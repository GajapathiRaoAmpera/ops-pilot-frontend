export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled" | "approval_required" | "timed_out";

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  queued: "Queued",
  running: "Running",
  succeeded: "Succeeded",
  failed: "Failed",
  cancelled: "Cancelled",
  approval_required: "Approval required",
  timed_out: "Timed out",
};

export type RunbookCategory = "K8s" | "Database" | "Security" | "Ingress";

export interface Runbook {
  id: string;
  category: RunbookCategory;
  title: string;
  description: string;
  target: string;
  estimate: string;
  highImpact?: boolean;
  runningNow?: boolean;
}

export interface JobStage {
  name: string;
  status: JobStatus;
  detail: string;
}

export interface JobRun {
  ref: string;
  runbook: string;
  environment: string;
  triggeredBy: string;
  status: JobStatus;
  duration: string;
  executedAt: string;
}

export interface LogLine {
  t: string;
  text: string;
}

export interface ActiveJob extends JobRun {
  stages: JobStage[];
  log: LogLine[];
}

export interface AutomationSummary {
  label: string;
  value: string;
  sub: string;
  chip?: string;
}
