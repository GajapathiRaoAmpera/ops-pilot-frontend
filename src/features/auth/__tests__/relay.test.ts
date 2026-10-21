const backendFetch = vi.fn();
vi.mock("../server/backend", () => ({ backendFetch: (...a: unknown[]) => backendFetch(...a) }));
vi.mock("next/headers", () => ({ cookies: async () => ({ toString: () => "sid=abc" }) }));

import { DELETE, GET, POST, PUT } from "../../../app/api/backend/[...path]/route";

const ctx = (p: string) => ({ params: Promise.resolve({ path: p.split("/") }) });
const req = (method: string, headers: Record<string, string> = {}, body?: string) =>
  new Request("http://app.test/api/backend/x", { method, headers: { host: "app.test", ...headers }, body });

beforeEach(() => backendFetch.mockReset().mockImplementation(async () => new Response("{}", { status: 200 })));

describe("/api/backend relay", () => {
  it("rejects paths outside the allowlist without calling the backend", async () => {
    for (const p of ["auth/login", "auth/me", "workspaces/x/pipelines/runs", "org/../platform/organizations/x", "workspaces/" + "0".repeat(8) + "-0000-0000-0000-" + "0".repeat(12) + "/pipelines/runs/extra", "platform/organizations/x"]) {
      expect((await GET(req("GET"), ctx(p))).status).toBe(404);
    }
    expect(backendFetch).not.toHaveBeenCalled();
  });
  it("forwards only whitelisted query keys", async () => {
    await GET(new Request("http://app.test/api/backend/audit-events?outcome=failure&evil=1&limit=5", { headers: { host: "app.test" } }), ctx("audit-events"));
    expect(backendFetch.mock.calls[0][0]).toBe("/audit-events?limit=5&outcome=failure");
  });
  it("blocks cross-origin writes", async () => {
    const r = await POST(req("POST", { origin: "https://evil.test" }, "{}"), ctx("org/invitations"));
    expect(r.status).toBe(403);
    expect(backendFetch).not.toHaveBeenCalled();
  });
  it("blocks writes with no Origin header", async () => {
    expect((await DELETE(req("DELETE"), ctx("org/invitations/" + "0".repeat(8) + "-0000-0000-0000-" + "0".repeat(12)))).status).toBe(403);
  });
  it("relays PUT (GitHub connect) to the allowlisted integration path only, same-origin", async () => {
    const ws = "0".repeat(8) + "-0000-0000-0000-" + "0".repeat(12);
    const ok = await PUT(req("PUT", { origin: "http://app.test" }, '{"repo":"a/b"}'), ctx(`workspaces/${ws}/integrations/github`));
    expect(ok.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith(`/workspaces/${ws}/integrations/github`, expect.objectContaining({ method: "PUT" }));
    backendFetch.mockClear();
    expect((await PUT(req("PUT", { origin: "https://evil.test" }, "{}"), ctx(`workspaces/${ws}/integrations/github`))).status).toBe(403);
    expect((await PUT(req("PUT", { origin: "http://app.test" }, "{}"), ctx("org/members"))).status).toBe(200); // allowlisted path, backend decides
    expect((await PUT(req("PUT", { origin: "http://app.test" }, "{}"), ctx("auth/login"))).status).toBe(404);
  });
  it("forwards allowed same-origin calls with the session cookie and no set-cookie back", async () => {
    backendFetch.mockResolvedValue(new Response('{"ok":true}', { status: 201, headers: { "set-cookie": "x=y" } }));
    const r = await POST(req("POST", { origin: "http://app.test" }, '{"email":"a@b.co"}'), ctx("org/invitations"));
    expect(r.status).toBe(201);
    expect(r.headers.get("set-cookie")).toBeNull();
    expect(backendFetch).toHaveBeenCalledWith("/org/invitations", expect.objectContaining({
      method: "POST", headers: expect.objectContaining({ cookie: "sid=abc" }) }));
  });
});
