import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import { PlatformView } from "../components/PlatformView";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const orgs = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Acme", status: "active", workspaces: 1, members: 2 },
  { id: "22222222-2222-2222-2222-222222222222", name: "Beta", status: "suspended", workspaces: 1, members: 1 },
];
const member = { membershipId: "m1", userId: "u1", email: "dev@acme.io", name: "Dev", role: "devops_engineer", roleLabel: "DevOps Engineer",
  workspaceId: null, workspace: null, disabled: false, blocked: false };

function backend(extra: Record<string, () => unknown> = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    for (const [k, fn] of Object.entries(extra)) { const [m, part] = k.split(" "); if (m === method && url.includes(part)) return json(fn()); }
    if (url.endsWith("platform/organizations")) return json({ organizations: orgs });
    if (url.includes("/members")) return json({ members: [member] });
    if (url.includes("/workspaces")) return json({ workspaces: [{ id: "w1", name: "Default Workspace" }] });
    if (url.includes("meta/roles")) return json({ roles: [{ key: "viewer", label: "Viewer" }, { key: "devops_engineer", label: "DevOps Engineer" }], workspaceRoles: ["viewer"] });
    return json({ ok: true });
  });
}

describe("PlatformView", () => {
  beforeEach(() => { vi.spyOn(window, "confirm").mockReturnValue(true); });
  afterEach(() => vi.restoreAllMocks());

  it("shows status and offers the right lifecycle action per organization", async () => {
    backend();
    render(<ToastProvider><PlatformView /></ToastProvider>);
    const acme = (await screen.findByText("Acme")).closest("tr")!;
    const beta = screen.getByText("Beta").closest("tr")!;
    expect(within(acme).getByText("active")).toBeInTheDocument();
    expect(within(acme).getByRole("button", { name: "Block" })).toBeInTheDocument();
    expect(within(acme).queryByRole("button", { name: "Delete" })).not.toBeInTheDocument(); // block first
    expect(within(beta).getByText("blocked")).toBeInTheDocument();
    expect(within(beta).getByRole("button", { name: "Reactivate" })).toBeInTheDocument();
    expect(within(beta).getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("does not crash when an older backend sends no status (treated as active)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(json({ organizations: [{ id: orgs[0].id, name: "Legacy", workspaces: 1, members: 1 }] }));
    render(<ToastProvider><PlatformView /></ToastProvider>);
    const row = (await screen.findByText("Legacy")).closest("tr")!;
    expect(within(row).getByText("active")).toBeInTheDocument();
  });

  it("blocks an organization through the backend", async () => {
    const spy = backend();
    render(<ToastProvider><PlatformView /></ToastProvider>);
    await userEvent.click(within((await screen.findByText("Acme")).closest("tr")!).getByRole("button", { name: "Block" }));
    const call = spy.mock.calls.find(([, i]) => i?.method === "PATCH")!;
    expect(String(call[0])).toContain("platform/organizations/11111111-1111-1111-1111-111111111111");
    expect(JSON.parse(call[1]!.body as string)).toEqual({ status: "suspended" });
  });

  it("manages people: block in the org, reset password, block the account", async () => {
    const spy = backend({ "POST reset-link": () => ({ token: "t".repeat(30), expiresAt: "x" }) });
    render(<ToastProvider><PlatformView /></ToastProvider>);
    await userEvent.click(within((await screen.findByText("Acme")).closest("tr")!).getByRole("button", { name: "Manage people" }));
    const row = (await screen.findByText("dev@acme.io")).closest("tr")!;
    await userEvent.click(within(row).getByRole("button", { name: "Block here" }));
    await userEvent.click(within(row).getByRole("button", { name: "Reset password" }));
    expect(await screen.findByText(/Password reset for dev@acme.io/)).toBeInTheDocument();
    await userEvent.click(within(row).getByRole("button", { name: "Block account" }));
    const posts = spy.mock.calls.filter(([, i]) => i?.method === "POST").map(([u, i]) => [String(u).replace(/.*api\/backend\//, ""), i!.body]);
    expect(posts).toEqual(expect.arrayContaining([
      ["platform/organizations/11111111-1111-1111-1111-111111111111/members/u1/block", JSON.stringify({ blocked: true })],
      ["platform/users/u1/block", JSON.stringify({ blocked: true })],
    ]));
  });
});
