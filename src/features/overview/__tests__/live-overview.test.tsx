import { render, screen, within } from "@testing-library/react";
import { LiveOverview } from "../components/LiveOverview/LiveOverview";
import type { OverviewSummary } from "../server/summary";

const base: OverviewSummary = {
  pipelines: { connected: true, counts: { failure: 1 }, total: 1, lastSyncedAt: null,
    recent: [{ id: "r1", repo: "o/r", workflow: "build", branch: "main", commit: "abc1234", status: "completed", conclusion: "failure", url: "", startedAt: null }] },
  approvals: { pending: 2, items: [{ id: "a1", risk: "medium", createdAt: "2026-01-01T00:00:00Z", requester: "Sam", workflow: "CodeQL", repo: "o/r", branch: "main" }] },
  lastExecution: null,
  recentExecutions: [{ id: "e1", status: "succeeded", type: "rerun_failed_jobs", workflow: "build", repo: "o/r", createdAt: "2026-01-01T00:00:00Z" }],
  activity: [{ id: 1, ts: "2026-01-01T00:00:00Z", actor: "Boss", action: "approval.approve", resource: "request:1", outcome: "success" }],
  visible: { approvals: true, executions: true, activity: true },
  notConnected: ["incidents"],
};

describe("LiveOverview", () => {
  it("shows pending decisions, recent automation, runs and activity from real data", () => {
    render(<LiveOverview data={base} />);
    const pending = screen.getByRole("list", { name: "Requests waiting for a decision" });
    expect(within(pending).getByText(/Re-run failed jobs · CodeQL/)).toBeInTheDocument();
    expect(within(pending).getByText(/asked by Sam/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Needs a decision \(2\)/ })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Recent automation" })).getByText("succeeded")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Workspace activity" })).getByText("approval.approve")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "GitHub Actions runs" })).toBeInTheDocument();
    expect(screen.queryByText(/mock/i)).toBeNull();
  });

  it("explains hidden sections instead of showing zeros or fake rows", () => {
    render(<LiveOverview data={{ ...base, approvals: { pending: 2, items: [] }, recentExecutions: [], activity: [], visible: { approvals: false, executions: false, activity: false } }} />);
    expect(screen.getByText("Approvals are not shown to your role")).toBeInTheDocument();
    expect(screen.getByText(/2 requests are waiting for someone with approval rights/)).toBeInTheDocument();
    expect(screen.getByText("Automation history is not shown to your role")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Workspace activity" })).toBeNull();
  });

  it("shows directions for empty sections", () => {
    render(<LiveOverview data={{ ...base, approvals: { pending: 0, items: [] }, recentExecutions: [], activity: [] }} />);
    expect(screen.getByText("Nothing is waiting")).toBeInTheDocument();
    expect(screen.getByText("Nothing has run yet")).toBeInTheDocument();
    expect(screen.getByText("No activity recorded yet")).toBeInTheDocument();
  });
});
