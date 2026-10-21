/** UI-preview shapes. UNVERIFIED: no approvals backend contract exists yet. */
export type ApprovalRisk = "high" | "medium" | "low";

export interface ApprovalSignoff {
  slot: string;
  role: string;
  state: "recorded" | "awaiting";
  who?: string;
  detail?: string;
  note?: string;
}

export interface BlastMetric {
  label: string;
  value: string;
  sub: string;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  /** Lower is more severe (SEV-1 = 1). */
  severityRank: number;
  severityLabel: string;
  risk: ApprovalRisk;
  requester: string;
  ageMinutes: number;
  ageLabel: string;
  /** Static mock text, not a running timer. */
  ttlLabel: string;
  target: string;
  signedCount: number;
  requiredCount: number;
  policy: string;
  signoffs: ApprovalSignoff[];
  blast?: { metrics: BlastMetric[]; caption: string };
  changeFile?: string;
  changeLines: { kind: "context" | "remove" | "add"; text: string }[];
}

export type QueueTab = "all" | "high" | "normal" | "history";
export type QueueSort = "sev_desc" | "newest" | "oldest";
