import "server-only";
import { cookies } from "next/headers";
import { backendFetch } from "@/features/auth/server/backend";

export interface OverviewSummary {
  pipelines: { connected: boolean; counts: Record<string, number>; total: number; lastSyncedAt: string | null };
  approvals: { pending: number };
  lastExecution: { status: string; type: string } | null;
  notConnected: string[];
}

export type SummaryResult = { state: "ok"; data: OverviewSummary } | { state: "no-workspace" } | { state: "forbidden" } | { state: "error" };

export async function fetchOverview(workspaceId: string | undefined): Promise<SummaryResult> {
  if (!workspaceId) return { state: "no-workspace" };
  try {
    const res = await backendFetch(`/workspaces/${encodeURIComponent(workspaceId)}/overview`, { headers: { cookie: (await cookies()).toString() } });
    if (res.status === 403 || res.status === 404) return { state: "forbidden" };
    if (!res.ok) return { state: "error" };
    const d = await res.json();
    if (!d?.pipelines || !d?.approvals) return { state: "error" };
    return { state: "ok", data: d as OverviewSummary };
  } catch {
    return { state: "error" };
  }
}
