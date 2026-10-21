import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import { RunsPanel } from "../components/RunsPanel/RunsPanel";
import { RequestRerun, SyncButton } from "../components/RunsPanel/RunControls";

const run = { id: "run1", repo: "o/r", workflow: "build", branch: "main", commit: "abc1234", status: "completed", conclusion: "failure", url: "", startedAt: null };
const result = { state: "ok", connected: true, lastSyncedAt: null, runs: [run, { ...run, id: "run2", conclusion: "success" }] } as const;
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });

afterEach(() => vi.restoreAllMocks());

describe("run controls", () => {
  it("offers re-run only on failed runs, and only with execute permission", () => {
    const { rerender } = render(<ToastProvider><RunsPanel result={{ ...result, runs: [...result.runs] }} workspaceId="ws1" canExecute /></ToastProvider>);
    expect(screen.getAllByRole("button", { name: "Request re-run" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Sync now" })).toBeInTheDocument();
    rerender(<ToastProvider><RunsPanel result={{ ...result, runs: [...result.runs] }} workspaceId="ws1" canExecute={false} /></ToastProvider>);
    expect(screen.queryByRole("button", { name: "Request re-run" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sync now" })).toBeNull();
  });

  it("tells you the request is waiting (in a toast), not that anything ran", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ id: "r" }, 201));
    render(<ToastProvider><RequestRerun workspaceId="ws1" runId="run1" /></ToastProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Request re-run" }));
    await userEvent.type(screen.getByLabelText("Reason for re-run"), "flaky test");
    await userEvent.click(screen.getByRole("button", { name: "Send for approval" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/Request sent for approval.*Nothing runs until someone other than you approves it/);
    expect(screen.getByText("Awaiting approval")).toBeInTheDocument();
    expect(JSON.parse(spy.mock.calls[0][1]!.body as string)).toEqual({ runId: "run1", type: "rerun_failed_jobs", reason: "flaky test" });
    expect(refresh).toHaveBeenCalled();
  });

  it("surfaces a duplicate-request refusal", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ detail: "request_already_open" }, 409));
    render(<ToastProvider><RequestRerun workspaceId="ws1" runId="run1" /></ToastProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Request re-run" }));
    await userEvent.click(screen.getByRole("button", { name: "Send for approval" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/already open/); // inline: belongs to this form
  });

  it("reports sync results as toasts, with the technical reference for failures", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json({ detail: "upstream_error" }, 502))
      .mockResolvedValueOnce(json({ synced: 7 }));
    render(<ToastProvider><SyncButton workspaceId="ws1" /></ToastProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Sync now" }));
    const err = await screen.findByRole("alert");
    expect(err).toHaveTextContent(/Sync failed/);
    expect(err).toHaveTextContent(/GitHub did not accept the request/);
    expect(err).toHaveTextContent(/Reference: 502 upstream_error/);
    await userEvent.click(screen.getByRole("button", { name: "Sync now" }));
    expect(await screen.findByText(/7 runs updated from GitHub/)).toBeInTheDocument();
  });
});
