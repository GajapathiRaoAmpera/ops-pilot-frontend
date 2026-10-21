import { Card } from "@/components/ui/Card/Card";
import type { RunsResult } from "../../server/runs";
import { groupRunsByDay } from "../../runs-trend";
import { RunsTrendChart } from "./RunsTrendChart";

/** Real GitHub runs per day. Rendered only when there is data; the runs table below carries the empty states. */
export function RunsTrend({ result, now = new Date() }: { result: RunsResult; now?: Date }) {
  if (result.state !== "ok" || !result.connected || result.runs.length === 0) return null;
  const days = groupRunsByDay(result.runs, now, 14);
  return (
    <Card title="Runs per day (last 14 days)">
      <RunsTrendChart days={days} />
    </Card>
  );
}
