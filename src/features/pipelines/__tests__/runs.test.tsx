import { render, screen } from "@testing-library/react";
import { RunsPanel } from "../components/RunsPanel/RunsPanel";

const run = { id: "1", repo: "o/r", workflow: "build", branch: "main", commit: "abc1234", status: "completed", conclusion: "failure", url: "", startedAt: null };

describe("RunsPanel (real data)", () => {
  it("shows failed runs as text, and escapes untrusted values", () => {
    render(<RunsPanel result={{ state: "ok", connected: true, lastSyncedAt: null, runs: [{ ...run, workflow: "<img src=x onerror=alert(1)>" }] }} />);
    expect(screen.getByText("failed")).toBeInTheDocument();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
  });
  it.each([
    [{ state: "error" } as const, /temporarily unavailable/],
    [{ state: "forbidden" } as const, /do not have access/],
    [{ state: "no-workspace" } as const, /No workspace/],
    [{ state: "ok", connected: false, lastSyncedAt: null, runs: [] as never[] } as const, /not connected/],
    [{ state: "ok", connected: true, lastSyncedAt: null, runs: [] as never[] } as const, /No runs/],
  ])("renders non-data states", (result, text) => {
    render(<RunsPanel result={result} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});
