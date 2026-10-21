import type { OverviewSummary } from "./server/summary";

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/**
 * Validates the untrusted overview payload and fills anything an older or partial backend leaves out.
 * A missing section is treated as hidden (never as zero, never invented); null means the payload is unusable.
 */
export function parseOverview(raw: unknown): OverviewSummary | null {
  if (typeof raw !== "object" || raw === null) return null;
  const d = raw as Record<string, unknown>;
  const p = d.pipelines as Record<string, unknown> | undefined;
  const a = d.approvals as Record<string, unknown> | undefined;
  if (!p || typeof p !== "object" || !a || typeof a !== "object") return null;
  const v = (d.visible ?? {}) as Record<string, unknown>;
  return {
    pipelines: {
      connected: p.connected === true,
      counts: typeof p.counts === "object" && p.counts !== null ? (p.counts as Record<string, number>) : {},
      total: typeof p.total === "number" ? p.total : 0,
      lastSyncedAt: typeof p.lastSyncedAt === "string" ? p.lastSyncedAt : null,
      recent: arr(p.recent),
    },
    approvals: { pending: typeof a.pending === "number" ? a.pending : 0, items: arr(a.items) },
    lastExecution: (d.lastExecution as OverviewSummary["lastExecution"]) ?? null,
    recentExecutions: arr(d.recentExecutions),
    activity: arr(d.activity),
    visible: { approvals: v.approvals === true, executions: v.executions === true, activity: v.activity === true },
    notConnected: arr<string>(d.notConnected),
  };
}
