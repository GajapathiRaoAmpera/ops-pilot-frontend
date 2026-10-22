import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { buildSteps } from "@/features/approvals/live/DecisionTrail";
import type { LiveRequest } from "@/features/approvals/live/types";
import { FixPanel } from "../components/FixPanel";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const proposal = {
  id: "p1", runId: "r1", status: "proposed", title: "Fix add()", explanation: "add() subtracted.", files: ["src/app.py"],
  diff: "--- a/src/app.py\n+++ b/src/app.py\n@@ -1,2 +1,2 @@\n def add(a, b):\n-    return a - b\n+    return a + b\n",
  baseBranch: "main", baseSha: "aaaaaaa", model: "openai/gpt-oss-120b",
  trace: [{ step: "list_files", detail: "3 files" }, { step: "check", detail: "patch accepted" }], createdAt: "2026-10-22T10:00:00Z", createdBy: "Sri Ram",
};

describe("FixPanel", () => {
  afterEach(() => vi.restoreAllMocks());

  it("proposes a fix, shows the diff, and only sends it for approval", async () => {
    const spy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json({ proposals: [] }))
      .mockResolvedValueOnce(json(proposal))
      .mockResolvedValueOnce(json({ id: "req1" }, 201));
    render(<ToastProvider><FixPanel workspaceId="ws1" runId="r1" disabled={false} /></ToastProvider>);
    await userEvent.click(await screen.findByRole("button", { name: /Propose a fix/ }));
    expect(await screen.findByLabelText("Proposed change")).toHaveTextContent(/\+\s+return a \+ b/);
    await userEvent.click(screen.getByRole("button", { name: "Request approval to open PR" }));
    expect(await screen.findByText("awaiting approval")).toBeInTheDocument();
    expect(JSON.parse(spy.mock.calls[2][1]!.body as string)).toEqual({ runId: "r1", type: "open_fix_pr", proposalId: "p1", reason: "AI fix: Fix add()" });
  });

  it("says plainly when there is no safe fix and offers nothing to approve", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json({ proposals: [{ ...proposal, status: "no_fix", diff: "", explanation: "Credentials expired." }] }));
    render(<ToastProvider><FixPanel workspaceId="ws1" runId="r1" disabled={false} /></ToastProvider>);
    expect(await screen.findByText("Credentials expired.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Request approval to open PR" })).not.toBeInTheDocument();
  });
});

describe("decision trail for a fix pull request", () => {
  const base: LiveRequest = {
    id: "q", runId: "r1", type: "open_fix_pr", risk: "high", status: "succeeded", reason: "", requestedBy: "u", createdAt: "2026-10-22T10:00:00Z",
    requester: { name: "Sri Ram", email: "s@x" }, run: null,
    decision: { decision: "approve", decidedBy: "v", decidedByName: "Venkata", reason: "", decidedAt: "2026-10-22T10:05:00Z" },
    execution: { id: "e", status: "succeeded", error: "", result: { prUrl: "https://github.com/o/r/pull/7", prNumber: 7 }, endedAt: "2026-10-22T10:05:03Z" },
  };

  it("links the pull request and never claims it was merged", () => {
    const steps = buildSteps(base, null);
    expect(steps.map((s) => s.title)).toEqual(["Requested", "Approved", "Pull request opened", "Reviewed and merged in GitHub"]);
    expect(steps[3].state).toBe("current");
    render(<>{steps[2].body}</>);
    expect(screen.getByRole("link", { name: "pull request #7" })).toHaveAttribute("href", "https://github.com/o/r/pull/7");
  });

  it("ignores a pull request link that does not point at GitHub", () => {
    const steps = buildSteps({ ...base, execution: { ...base.execution!, result: { prUrl: "https://evil.example/x", prNumber: 7 } } }, null);
    render(<>{steps[2].body}</>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
