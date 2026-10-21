import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import { RunsPanel } from "../components/RunsPanel/RunsPanel";
import { RequestRerun } from "../components/RunsPanel/RunControls";

const run = { id: "run1", repo: "o/r", workflow: "build", branch: "main", commit: "abc1234", status: "completed", conclusion: "failure", url: "", startedAt: null };
const result = { state: "ok", connected: true, lastSyncedAt: null, runs: [run, { ...run, id: "run2", conclusion: "success" }] } as const;
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });

afterEach(() => vi.restoreAllMocks());

describe("run controls", () => {
  it("offers re-run only on failed runs, and only with execute permission", () => {
    const { rerender } = render(<RunsPanel result={{ ...result, runs: [...result.runs] }} workspaceId="ws1" canExecute />);
    expect(screen.getAllByRole("button", { name: "Request re-run" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Sync now" })).toBeInTheDocument();
    rerender(<RunsPanel result={{ ...result, runs: [...result.runs] }} workspaceId="ws1" canExecute={false} />);
    expect(screen.queryByRole("button", { name: "Request re-run" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sync now" })).toBeNull();
  });

  it("says the request is waiting, not that anything ran", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ id: "r" }, 201));
    render(<RequestRerun workspaceId="ws1" runId="run1" />);
    await userEvent.click(screen.getByRole("button", { name: "Request re-run" }));
    await userEvent.type(screen.getByLabelText("Reason for re-run"), "flaky test");
    await userEvent.click(screen.getByRole("button", { name: "Send for approval" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/Waiting for approval; nothing has run yet/);
    expect(JSON.parse(spy.mock.calls[0][1]!.body as string)).toEqual({ runId: "run1", type: "rerun_failed_jobs", reason: "flaky test" });
    expect(refresh).toHaveBeenCalled();
  });

  it("surfaces a duplicate-request refusal", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ detail: "request_already_open" }, 409));
    render(<RequestRerun workspaceId="ws1" runId="run1" />);
    await userEvent.click(screen.getByRole("button", { name: "Request re-run" }));
    await userEvent.click(screen.getByRole("button", { name: "Send for approval" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/already open/);
  });
});
