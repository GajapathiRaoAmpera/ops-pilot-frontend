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

export interface FailedRun { id: string; repo: string; workflow: string; branch: string; commit: string; conclusion: string | null; url: string; startedAt: string | null }
