import "server-only";
import { cookies } from "next/headers";
import { backendFetch } from "@/features/auth/server/backend";

export interface PipelineRun {
  id: string;
  repo: string;
  workflow: string;
  branch: string;
  commit: string;
  status: string;
  conclusion: string | null;
  url: string;
  startedAt: string | null;
}

export type RunsResult =
  | { state: "ok"; connected: boolean; lastSyncedAt: string | null; runs: PipelineRun[] }
  | { state: "no-workspace" }
  | { state: "forbidden" }
  | { state: "error" };

/** Real runs from the backend cache (`GET /workspaces/{id}/pipelines/runs`). The backend enforces scope. */
export async function fetchRuns(workspaceId: string | undefined): Promise<RunsResult> {
  if (!workspaceId) return { state: "no-workspace" };
  try {
    const res = await backendFetch(`/workspaces/${encodeURIComponent(workspaceId)}/pipelines/runs`, {
      headers: { cookie: (await cookies()).toString() },
    });
    if (res.status === 403 || res.status === 404) return { state: "forbidden" };
    if (!res.ok) return { state: "error" };
    const d = await res.json();
    if (!Array.isArray(d?.runs)) return { state: "error" };
    return { state: "ok", connected: Boolean(d.connected), lastSyncedAt: d.lastSyncedAt ?? null, runs: d.runs };
  } catch {
    return { state: "error" };
  }
}
