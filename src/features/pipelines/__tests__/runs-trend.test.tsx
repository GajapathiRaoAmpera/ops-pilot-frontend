import { render, screen, within } from "@testing-library/react";
import { groupRunsByDay } from "../runs-trend";
import { RunsTrend } from "../components/RunsTrend/RunsTrend";
import type { PipelineRun } from "../server/runs";
import { Sparkline } from "@/components/ui/charts/Sparkline";
import { MiniColumns } from "@/components/ui/charts/MiniColumns";

const now = new Date("2026-10-21T15:00:00Z");
const run = (over: Partial<PipelineRun>): PipelineRun => ({
  id: "1", repo: "o/r", workflow: "build", branch: "main", commit: "abc", status: "completed", conclusion: "success", url: "", startedAt: "2026-10-21T01:00:00Z", ...over,
});

describe("groupRunsByDay", () => {
  it("returns every day in the window, oldest first, with zeros for empty days", () => {
    const days = groupRunsByDay([], now, 14);
    expect(days).toHaveLength(14);
    expect(days[0].date).toBe("2026-10-08");
    expect(days[13].date).toBe("2026-10-21");
    expect(days.every((d) => d.succeeded + d.failed + d.other === 0)).toBe(true);
  });
  it("classifies succeeded, failed and everything else, and ignores runs outside the window or without a start", () => {
    const days = groupRunsByDay([
      run({}), run({ id: "2" }), run({ id: "3", conclusion: "failure" }),
      run({ id: "4", status: "in_progress", conclusion: null }), run({ id: "5", conclusion: "cancelled" }),
      run({ id: "6", startedAt: "2026-09-01T00:00:00Z" }), run({ id: "7", startedAt: null }),
    ], now, 14);
    const today = days[13];
    expect([today.succeeded, today.failed, today.other]).toEqual([2, 1, 2]);
    expect(days.reduce((n, d) => n + d.succeeded + d.failed + d.other, 0)).toBe(5);
  });
  it("buckets by UTC day, so the server and browser agree", () => {
    const days = groupRunsByDay([run({ startedAt: "2026-10-20T23:59:59Z" }), run({ id: "2", startedAt: "2026-10-21T00:00:00Z" })], now, 3);
    expect(days.map((d) => d.succeeded)).toEqual([0, 1, 1]);
  });
});

describe("RunsTrend", () => {
  const ok = (runs: PipelineRun[], connected = true) => ({ state: "ok", connected, lastSyncedAt: null, runs }) as const;

  it("renders nothing without data, so empty states stay in the runs table", () => {
    for (const result of [ok([]), ok([run({})], false), { state: "error" } as const]) {
      const { container, unmount } = render(<RunsTrend result={result} now={now} />);
      expect(container).toBeEmptyDOMElement();
      unmount();
    }
  });

  it("states totals in the image label, shows an icon+label legend, and offers a table view", () => {
    render(<RunsTrend result={ok([run({}), run({ id: "2", conclusion: "failure" }), run({ id: "3", conclusion: "failure" })])} now={now} />);
    expect(screen.getByRole("img", { name: /Runs per day, last 14 days \(UTC\): 1 succeeded, 2 failed, 0 other/ })).toBeInTheDocument();
    const legend = screen.getByRole("list", { name: "Legend" });
    expect(within(legend).getByText("Failed")).toBeInTheDocument();
    expect(within(legend).getByText("Succeeded")).toBeInTheDocument();
    const table = screen.getByRole("table", { hidden: true });
    expect(within(table).getAllByRole("row", { hidden: true })).toHaveLength(15);
    expect(screen.getByText("View as table")).toBeInTheDocument();
  });
});

describe("sparklines", () => {
  it("expose a text alternative", () => {
    render(<><Sparkline values={[1, 2, 3]} name="Rate" ariaLabel="Rate over 3 days" /><MiniColumns values={[1, 2]} name="Latency" ariaLabel="Latency samples" /></>);
    expect(screen.getByRole("img", { name: "Rate over 3 days" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Latency samples" })).toBeInTheDocument();
  });
});
