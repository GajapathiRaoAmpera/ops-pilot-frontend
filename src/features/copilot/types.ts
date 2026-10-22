export interface Investigation {
  id: string;
  runId: string;
  summary: string;
  rootCause: string;
  confidence: "low" | "medium" | "high";
  evidence: { quote: string; why: string }[];
  evidenceVerified: boolean;
  nextSteps: string[];
  suggestedAction: "rerun_failed_jobs" | "none";
  suggestionReason: string;
  model: string;
  createdAt: string;
  createdBy: string | null;
}

export interface FixProposal {
  id: string; runId: string; status: "proposed" | "no_fix"; title: string; explanation: string; files: string[]; diff: string;
  baseBranch: string; baseSha: string; model: string; trace: { step: string; detail: string }[]; createdAt: string; createdBy: string | null;
}

export interface FailedRun { id: string; repo: string; workflow: string; branch: string; commit: string; conclusion: string | null; url: string; startedAt: string | null }
