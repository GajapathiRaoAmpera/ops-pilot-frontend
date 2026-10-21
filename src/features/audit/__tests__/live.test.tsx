import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LiveAudit } from "../live/LiveAudit";
import { LiveRbac } from "@/features/rbac/live/LiveRbac";
import { LiveSummary } from "@/features/overview/components/LiveSummary/LiveSummary";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const ev = (id: number, over = {}) => ({ id, ts: "2026-01-01T00:00:00Z", actorName: "Ann", actorEmail: "ann@a.test", action: "auth.login", resource: "", outcome: "success", detail: "", ...over });

afterEach(() => vi.restoreAllMocks());

describe("LiveAudit", () => {
  it("renders untrusted text as text, applies server filters and pages with a cursor", async () => {
    const spy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json({ events: [ev(2, { detail: "<img src=x onerror=alert(1)>" })], nextBefore: 2 }))
      .mockResolvedValueOnce(json({ events: [ev(1)], nextBefore: null }))
      .mockResolvedValue(json({ events: [], nextBefore: null }));
    render(<LiveAudit />);
    expect(await screen.findByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /Load older/ }));
    expect(spy.mock.calls[1][0]).toContain("before_id=2");
    await userEvent.selectOptions(screen.getByLabelText("Outcome"), "failure");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    await screen.findByText("No events match.");
    expect(String(spy.mock.calls[2][0])).toContain("outcome=failure");
  });
  it("shows a denied state", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ detail: "forbidden" }, 403));
    render(<LiveAudit />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/do not have permission/);
  });
});

describe("LiveRbac", () => {
  it("builds the matrix from the backend roles", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ roles: [
      { key: "a", label: "Admin", permissions: ["x:y:z", "p:q:r"] }, { key: "v", label: "Viewer", permissions: ["p:q:r"] }] }));
    render(<LiveRbac />);
    expect(await screen.findByRole("columnheader", { name: "Viewer" })).toBeInTheDocument();
    const row = screen.getByRole("row", { name: /x:y:z/ });
    expect(row).toHaveTextContent("allowed");
    expect(row).toHaveTextContent("denied");
  });
});

describe("LiveSummary", () => {
  const ok = { pipelines: { connected: true, counts: { failure: 2, success: 5 }, total: 7, lastSyncedAt: null }, approvals: { pending: 3 }, lastExecution: null, notConnected: ["incidents"] };
  it("shows real figures and names what is not connected", () => {
    render(<LiveSummary result={{ state: "ok", data: ok }} />);
    expect(screen.getByText("Pending approvals").nextSibling).toHaveTextContent("3");
    expect(screen.getByText(/Not connected yet: incidents/)).toBeInTheDocument();
  });
  it("tells you to connect GitHub rather than showing zeros", () => {
    render(<LiveSummary result={{ state: "ok", data: { ...ok, pipelines: { ...ok.pipelines, connected: false } } }} />);
    expect(screen.getByText(/not connected for this workspace/)).toBeInTheDocument();
    expect(screen.queryByText("Failed")).toBeNull();
  });
  it.each([["error", /temporarily unavailable/], ["forbidden", /do not have access/], ["no-workspace", /No workspace/]] as const)("handles %s", (state, text) => {
    render(<LiveSummary result={{ state }} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});
