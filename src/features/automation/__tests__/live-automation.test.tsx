import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { LiveRequest } from "@/features/approvals/live/types";
import { LiveAutomation } from "../live/LiveAutomation";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const row = (over: Partial<LiveRequest> = {}): LiveRequest => ({
  id: "r1", runId: "run1", type: "rerun_failed_jobs", risk: "medium", status: "succeeded", reason: "", requestedBy: "u",
  createdAt: "2026-01-01T00:00:00Z", requester: { name: "Sam", email: "s@a.test" },
  run: { repo: "o/r", workflow: "CodeQL", branch: "main", commit: "abc", status: "completed", conclusion: "failure", url: "" },
  decision: { decision: "approve", decidedBy: "b", decidedByName: "Boss", reason: "", decidedAt: "2026-01-01T00:01:00Z" },
  execution: { id: "e", status: "succeeded", error: "", result: { observedStatus: "queued" }, endedAt: "2026-01-01T00:01:02Z" }, ...over,
});

afterEach(() => vi.restoreAllMocks());

describe("LiveAutomation", () => {
  it("lists the allowlisted action and the real history with who asked and who approved", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ executions: [row()] }));
    render(<LiveAutomation workspaceId="ws1" />);
    expect(screen.getByText("Restarts only the failed jobs of a failed GitHub Actions run. Nothing in the code changes.")).toBeInTheDocument();
    expect(screen.getAllByText("Re-run failed jobs").length).toBeGreaterThan(0);
    const history = await screen.findByRole("table", { name: "Automation history" });
    expect(history).toHaveTextContent("CodeQL");
    expect(history).toHaveTextContent("Sam");
    expect(history).toHaveTextContent("Boss");
    expect(history).toHaveTextContent("GitHub reports the run as queued");
    expect(spy.mock.calls[0][0]).toBe("/api/backend/workspaces/ws1/executions");
  });

  it("reports a failed execution with GitHub's reason code and filters server-side", async () => {
    const spy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json({ executions: [] }))
      .mockResolvedValueOnce(json({ executions: [row({ execution: { id: "e", status: "failed", error: "github_403", result: {}, endedAt: null } })] }));
    render(<LiveAutomation workspaceId="ws1" />);
    await screen.findByText("Nothing has run yet");
    await userEvent.click(screen.getByRole("button", { name: "Failed" }));
    expect(screen.getByRole("button", { name: "Failed" })).toHaveAttribute("aria-pressed", "true");
    const table = await screen.findByRole("table", { name: "Automation history" });
    expect(within(table).getByText("failed")).toBeInTheDocument();
    expect(table).toHaveTextContent("GitHub did not accept it (github_403)");
    expect(spy.mock.calls[1][0]).toBe("/api/backend/workspaces/ws1/executions?status=failed");
  });

  it("shows a permission error from the backend", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ detail: "forbidden" }, 403));
    render(<LiveAutomation workspaceId="ws1" />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/do not have permission/));
  });
});
