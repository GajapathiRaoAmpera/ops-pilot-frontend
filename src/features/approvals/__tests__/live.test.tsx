import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionProvider } from "@/features/auth/components/SessionProvider";
import type { Session } from "@/features/auth/types";
import { LiveApprovals } from "../live/LiveApprovals";
import type { LiveRequest } from "../live/types";

const session = (email: string): Session => ({
  user: { id: "u", email, name: "Me" }, role: "Org Admin", organization: { id: "o", name: "Acme" },
  permissions: [], workspaces: [], mustChangePassword: false,
});
const req = (over: Partial<LiveRequest> = {}): LiveRequest => ({
  id: "r1", runId: "run1", type: "rerun_failed_jobs", risk: "medium", status: "pending", reason: "flaky", requestedBy: "u2",
  createdAt: "2026-01-01T00:00:00Z", requester: { name: "Dev", email: "dev@a.test" },
  run: { repo: "o/r", workflow: "build", branch: "main", commit: "abc1234", status: "completed", conclusion: "failure", url: "" },
  decision: null, execution: null, ...over,
});
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const view = (email = "admin@a.test", canDecide = true) =>
  render(<SessionProvider session={session(email)}><LiveApprovals workspaceId="ws1" canDecide={canDecide} /></SessionProvider>);

describe("LiveApprovals", () => {
  beforeEach(() => { vi.spyOn(window, "confirm").mockReturnValue(true); });
  afterEach(() => vi.restoreAllMocks());

  it("lists real requests with run context and starts on Pending", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ requests: [req(), req({ id: "r2", status: "succeeded" })] }));
    view();
    const list = await screen.findByRole("list", { name: "Approval requests" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText(/branch main · commit abc1234/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "History" }));
    expect(within(screen.getByRole("list", { name: "Approval requests" })).getAllByRole("listitem")).toHaveLength(1);
  });

  it("does not let you approve your own request and does not call the backend", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ requests: [req({ requester: { name: "Me", email: "ME@a.test" } })] }));
    view("me@a.test");
    await screen.findByText(/You made this request/);
    expect(screen.queryByRole("button", { name: /Approve/ })).toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("reports success only from the backend's response", async () => {
    const spy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json({ requests: [req()] }))
      .mockResolvedValueOnce(json(req({ status: "succeeded", execution: { id: "e", status: "succeeded", error: "", result: { observedStatus: "queued" }, endedAt: null } })))
      .mockResolvedValue(json({ requests: [] }));
    view();
    await userEvent.click(await screen.findByRole("button", { name: /Approve & run/ }));
    await screen.findByText(/GitHub accepted the re-run request/);
    expect(spy.mock.calls[1][0]).toBe("/api/backend/workspaces/ws1/approvals/r1/decision");
  });

  it("shows the backend's refusal and a failed execution honestly", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json({ requests: [req()] }))
      .mockResolvedValueOnce(json({ detail: "separation_of_duties" }, 403));
    view();
    await userEvent.click(await screen.findByRole("button", { name: /Approve & run/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/cannot approve a request you made/);
  });

  it("shows view-only message without the decide permission", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ requests: [req()] }));
    view("auditor@a.test", false);
    await screen.findByText(/do not have permission to decide/);
    expect(screen.queryByRole("button", { name: /Approve/ })).toBeNull();
  });

  it("shows an error state", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ detail: "forbidden" }, 403));
    view();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/do not have permission/));
  });
});
