import "server-only";
import { cookies } from "next/headers";
import { backendFetch } from "@/features/auth/server/backend";
import { parseOverview } from "../parse";

export interface PendingItem { id: string; type?: string; risk: string; createdAt: string; requester: string | null; workflow: string; repo: string; branch: string }
export interface RecentExecution { id: string; status: string; type: string; workflow: string; repo: string; createdAt: string }
export interface ActivityItem { id: number; ts: string; actor: string | null; action: string; resource: string; outcome: string }

export interface OverviewSummary {
  pipelines: {
    connected: boolean; counts: Record<string, number>; total: number; lastSyncedAt: string | null;
    recent: { id: string; repo: string; workflow: string; branch: string; commit: string; status: string; conclusion: string | null; url: string; startedAt: string | null }[];
  };
  approvals: { pending: number; items: PendingItem[] };
  lastExecution: { status: string; type: string } | null;
  recentExecutions: RecentExecution[];
  activity: ActivityItem[];
  visible: { approvals: boolean; executions: boolean; activity: boolean };
  notConnected: string[];
}

export type SummaryResult = { state: "ok"; data: OverviewSummary } | { state: "no-workspace" } | { state: "forbidden" } | { state: "error" };

export async function fetchOverview(workspaceId: string | undefined): Promise<SummaryResult> {
  if (!workspaceId) return { state: "no-workspace" };
  try {
    const res = await backendFetch(`/workspaces/${encodeURIComponent(workspaceId)}/overview`, { headers: { cookie: (await cookies()).toString() } });
    if (res.status === 403 || res.status === 404) return { state: "forbidden" };
    if (!res.ok) return { state: "error" };
    const data = parseOverview(await res.json());
    return data ? { state: "ok", data } : { state: "error" };
  } catch {
    return { state: "error" };
  }
}
