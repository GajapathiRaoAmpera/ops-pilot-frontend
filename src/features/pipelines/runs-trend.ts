import type { PipelineRun } from "./server/runs";

export interface DayBucket {
  /** ISO date (UTC), also the sort key. */
  date: string;
  /** Short label for the axis, in UTC so the server and browser agree. */
  day: string;
  succeeded: number;
  failed: number;
  other: number;
}

const FMT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Buckets runs into the last `days` UTC days ending at `now`, oldest first. Empty days are kept as zeros. */
export function groupRunsByDay(runs: readonly PipelineRun[], now: Date, days = 14): DayBucket[] {
  const buckets = new Map<string, DayBucket>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const date = d.toISOString().slice(0, 10);
    buckets.set(date, { date, day: FMT.format(d), succeeded: 0, failed: 0, other: 0 });
  }
  for (const r of runs) {
    if (!r.startedAt) continue;
    const b = buckets.get(new Date(r.startedAt).toISOString().slice(0, 10));
    if (!b) continue;
    if (r.status === "completed" && r.conclusion === "success") b.succeeded++;
    else if (r.status === "completed" && r.conclusion === "failure") b.failed++;
    else b.other++;
  }
  return [...buckets.values()];
}
