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
  | { state: "ok"; connected: boolean; lastSyncedAt: string | null; runs: PipelineRun[]; repositories?: string[] }
  | { state: "no-workspace" }
  | { state: "forbidden" }
  | { state: "error" };

/** Real runs from the backend cache (`GET /workspaces/{id}/pipelines/runs`). The backend enforces scope. */
export async function fetchRuns(workspaceId: string | undefined, repo?: string): Promise<RunsResult> {
  if (!workspaceId) return { state: "no-workspace" };
  const q = repo ? `?repo=${encodeURIComponent(repo)}` : "";
  try {
    const res = await backendFetch(`/workspaces/${encodeURIComponent(workspaceId)}/pipelines/runs${q}`, {
      headers: { cookie: (await cookies()).toString() },
    });
    if (res.status === 403 || res.status === 404) return { state: "forbidden" };
    if (!res.ok) return { state: "error" };
    const d = await res.json();
    if (!Array.isArray(d?.runs)) return { state: "error" };
    const repositories = Array.isArray(d.repositories) ? d.repositories.filter((x: unknown): x is string => typeof x === "string") : [];
    return { state: "ok", connected: Boolean(d.connected), lastSyncedAt: d.lastSyncedAt ?? null, runs: d.runs, repositories };
  } catch {
    return { state: "error" };
  }
}
