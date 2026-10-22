import { hasPermission, PERMISSIONS } from "../permissions";
import { landingPath, permissionForPath, safeNextPath, visibleNavItems } from "../navigation";
import { parseSession } from "../session-parser";

describe("hasPermission", () => {
  it("grants only held permissions and denies by default", () => {
    expect(hasPermission([PERMISSIONS.auditRead], PERMISSIONS.auditRead)).toBe(true);
    expect(hasPermission([PERMISSIONS.auditRead], PERMISSIONS.rbacRead)).toBe(false);
    expect(hasPermission(undefined, PERMISSIONS.auditRead)).toBe(false);
    expect(hasPermission(null, PERMISSIONS.auditRead)).toBe(false);
    expect(hasPermission("sec:telemetry:audit" as unknown as string[], PERMISSIONS.auditRead)).toBe(false);
  });
});

describe("navigation by permission", () => {
  it("shows only permitted items", () => {
    const hrefs = visibleNavItems([PERMISSIONS.auditRead, PERMISSIONS.overviewRead]).map((i) => i.href);
    expect(hrefs).toEqual(["/overview", "/audit"]);
  });
  it("shows Cloud and Settings only with their own management permission", () => {
    const all = [PERMISSIONS.overviewRead, PERMISSIONS.rbacRead];
    expect(visibleNavItems(all).map((i) => i.href)).toEqual(["/overview", "/rbac"]);
    expect(visibleNavItems([...all, PERMISSIONS.cloudManage]).map((i) => i.href)).toEqual(["/overview", "/cloud", "/rbac"]);
    expect(visibleNavItems([PERMISSIONS.integrationsManage]).map((i) => i.href)).toEqual(["/settings"]);
  });
  it("shows nothing and no landing page without permissions", () => {
    expect(visibleNavItems([])).toEqual([]);
    expect(landingPath([])).toBeNull();
  });
  it("lands on the first authorised page", () => {
    expect(landingPath([PERMISSIONS.auditRead])).toBe("/audit");
  });
  it("maps direct URLs to the permission that protects them", () => {
    expect(permissionForPath("/rbac")).toBe(PERMISSIONS.rbacRead);
    expect(permissionForPath("/rbac/roles/1")).toBe(PERMISSIONS.rbacRead);
    expect(permissionForPath("/nope")).toBeUndefined();
  });
});

describe("safeNextPath", () => {
  it.each([
    ["/pipelines", "/pipelines"],
    ["/audit?x=1", "/audit?x=1"],
    ["//evil.com", null],
    ["https://evil.com", null],
    ["/\\evil.com", null],
    ["/login", null],
    ["/api/auth/logout", null],
    ["", null],
    [undefined, null],
  ])("%s -> %s", (input, expected) => {
    expect(safeNextPath(input as string | undefined)).toBe(expected);
  });
});

describe("parseSession", () => {
  const valid = {
    user: { id: "u1", email: "a@b.co", name: "A" },
    role: "Viewer",
    organization: { id: "o1", name: "Acme" },
    permissions: ["sys:overview:read"],
  };
  it("accepts a well-formed payload", () => {
    expect(parseSession(valid)?.permissions).toEqual(["sys:overview:read"]);
  });
  it.each([null, "x", {}, { ...valid, permissions: "all" }, { ...valid, permissions: [1] }, { ...valid, user: null }, { ...valid, organization: {} }])(
    "rejects malformed payload %#",
    (bad) => expect(parseSession(bad)).toBeNull(),
  );
});
