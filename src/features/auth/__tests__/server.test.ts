const backendFetch = vi.fn();
vi.mock("../server/backend", () => ({ backendFetch: (...a: unknown[]) => backendFetch(...a) }));

const cookieString = vi.fn(() => "sid=abc");
vi.mock("next/headers", () => ({ cookies: async () => ({ toString: cookieString, getAll: () => [{ name: "sid" }] }) }));

class Redirect extends Error { constructor(public to: string) { super(to); } }
vi.mock("next/navigation", () => ({ redirect: (to: string) => { throw new Redirect(to); } }));

import { fetchSession, requireSession } from "../server/session";
import { POST as login } from "../../../app/api/auth/login/route";
import { PERMISSIONS } from "../permissions";

const me = (permissions: string[]) => ({
  user: { id: "u", email: "a@b.co", name: "A" },
  role: "Viewer",
  organization: { id: "o", name: "Acme" },
  permissions,
});
const jsonRes = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), { status, headers });

beforeEach(() => backendFetch.mockReset());

describe("fetchSession", () => {
  it("is unauthenticated without a cookie and never calls the backend", async () => {
    expect(await fetchSession("")).toEqual({ status: "unauthenticated" });
    expect(backendFetch).not.toHaveBeenCalled();
  });
  it("maps 401 to unauthenticated (expired session)", async () => {
    backendFetch.mockResolvedValue(new Response(null, { status: 401 }));
    expect(await fetchSession("sid=x")).toEqual({ status: "unauthenticated" });
  });
  it("maps 5xx, network failure, and malformed payloads to error", async () => {
    backendFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
    expect(await fetchSession("sid=x")).toEqual({ status: "error" });
    backendFetch.mockRejectedValueOnce(new Error("down"));
    expect(await fetchSession("sid=x")).toEqual({ status: "error" });
    backendFetch.mockResolvedValueOnce(jsonRes({ role: "Admin" }));
    expect(await fetchSession("sid=x")).toEqual({ status: "error" });
  });
});

describe("requireSession (unauthorized direct URL access)", () => {
  it("redirects to /unauthorized when the permission is missing", async () => {
    backendFetch.mockResolvedValue(jsonRes(me([PERMISSIONS.overviewRead])));
    await expect(requireSession(PERMISSIONS.rbacRead)).rejects.toMatchObject({ to: "/unauthorized" });
  });
  it("allows access when the permission is held", async () => {
    backendFetch.mockResolvedValue(jsonRes(me([PERMISSIONS.rbacRead])));
    await expect(requireSession(PERMISSIONS.rbacRead)).resolves.toMatchObject({ role: "Viewer" });
  });
  it("redirects to /login on an expired session (API 401)", async () => {
    backendFetch.mockResolvedValue(new Response(null, { status: 401 }));
    await expect(requireSession(PERMISSIONS.rbacRead)).rejects.toMatchObject({ to: "/login?reason=expired" });
  });
  it("denies when the backend returns an unusable response", async () => {
    backendFetch.mockResolvedValue(new Response("<html>bad gateway</html>", { status: 200 }));
    await expect(requireSession(PERMISSIONS.rbacRead)).rejects.toHaveProperty("to", "/login?reason=unavailable");
  });
});

describe("POST /api/auth/login", () => {
  const req = (body: unknown, origin: string | null = "http://localhost:3000") =>
    new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { host: "localhost:3000", "content-type": "application/json", ...(origin ? { origin } : {}) },
      body: JSON.stringify(body),
    });

  it("rejects cross-origin requests", async () => {
    const res = await login(req({ email: "a@b.co", password: "x" }, "http://evil.example"));
    expect(res.status).toBe(403);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it("returns a generic 401 for bad credentials", async () => {
    backendFetch.mockResolvedValue(new Response(JSON.stringify({ detail: "user not found" }), { status: 401 }));
    const res = await login(req({ email: "a@b.co", password: "bad" }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "invalid_credentials" });
  });

  it("maps 429 and backend outages without leaking details", async () => {
    backendFetch.mockResolvedValueOnce(new Response(null, { status: 429 }));
    expect((await login(req({ email: "a@b.co", password: "x" }))).status).toBe(429);
    backendFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const res = await login(req({ email: "a@b.co", password: "x" }));
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toContain("ECONNREFUSED");
  });

  it("forwards the backend cookie, derives the landing page from the trusted session, and returns no token", async () => {
    backendFetch
      .mockResolvedValueOnce(jsonRes({ access_token: "SECRET" }, 200, { "set-cookie": "sid=abc; HttpOnly; SameSite=Lax; Path=/" }))
      .mockResolvedValueOnce(jsonRes(me([PERMISSIONS.auditRead])));
    const res = await login(req({ email: "a@b.co", password: "x", role: "Platform Admin" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("HttpOnly");
    const body = await res.json();
    expect(body).toEqual({ redirectTo: "/audit" });
    expect(JSON.stringify(body)).not.toContain("SECRET");
    expect(backendFetch.mock.calls[1][1].headers.cookie).toBe("sid=abc");
  });

  it("ignores unsafe `next` values", async () => {
    backendFetch
      .mockResolvedValueOnce(jsonRes({}, 200, { "set-cookie": "sid=abc; HttpOnly" }))
      .mockResolvedValueOnce(jsonRes(me([PERMISSIONS.overviewRead])));
    const res = await login(req({ email: "a@b.co", password: "x", next: "//evil.com" }));
    expect(await res.json()).toEqual({ redirectTo: "/overview" });
  });
});

describe("POST /api/auth/login in UI-preview mode", () => {
  afterEach(() => vi.unstubAllEnvs());
  const req = () =>
    new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { host: "localhost:3000", origin: "http://localhost:3000", "content-type": "application/json" },
      body: JSON.stringify({ email: "a@b.co", password: "x" }),
    });

  it("skips the backend and sets no cookie when the guard switch is on", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("OPSPILOT_AUTH_GUARD", "off");
    const res = await login(req());
    expect(await res.json()).toEqual({ redirectTo: "/overview" });
    expect(res.headers.get("set-cookie")).toBeNull();
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it("still calls the backend in production even if the flag is set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("OPSPILOT_AUTH_GUARD", "off");
    backendFetch.mockResolvedValue(new Response(null, { status: 401 }));
    expect((await login(req())).status).toBe(401);
  });
});
