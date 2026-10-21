export interface LiveRequest {
  id: string;
  runId: string;
  type: string;
  risk: "low" | "medium" | "high" | string;
  status: "pending" | "rejected" | "approved" | "executing" | "succeeded" | "failed" | string;
  reason: string;
  requestedBy: string;
  createdAt: string;
  requester: { name: string; email: string } | null;
  run: { repo: string; workflow: string; branch: string; commit: string; status: string; conclusion: string | null; url: string } | null;
  decision: { decision: string; decidedBy: string; decidedByName?: string | null; reason: string; decidedAt: string } | null;
  execution: { id: string; status: string; error: string; result: Record<string, unknown>; endedAt: string | null } | null;
}
