import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import { PERMISSIONS } from "@/features/auth/permissions";
import { parseSession } from "@/features/auth/session-parser";
import type { Session } from "@/features/auth/types";
import { destinationAfterSwitch } from "../after-switch";
import { OrganizationSwitcher } from "../OrganizationSwitcher";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }), usePathname: () => "/audit" }));
let session: Session;
vi.mock("@/features/auth/components/SessionProvider", () => ({ useSession: () => session }));

const base: Session = {
  user: { id: "u", email: "u@x", name: "U" }, role: "Organization Administrator", organization: { id: "A", name: "Acme" },
  permissions: [PERMISSIONS.auditRead], workspaces: [], activeWorkspaceId: null, mustChangePassword: false,
  organizations: [{ id: "A", name: "Acme", role: "Organization Administrator" }],
};

describe("active organization and workspace", () => {
  beforeEach(() => { push.mockReset(); refresh.mockReset(); session = base; });

  it("parses the organization list and only accepts an active workspace the user has", () => {
    const s = parseSession({
      user: { id: "u", email: "u@x", name: "U" }, role: "Viewer", organization: { id: "B", name: "Beta" }, permissions: [],
      organizations: [{ id: "A", name: "Acme", role: "Admin" }, { id: "B", name: "Beta", role: "Viewer" }, { bad: true }],
      workspaces: [{ id: "w1", name: "One", role: "Viewer" }], activeWorkspaceId: "w1",
    })!;
    expect(s.organizations.map((o) => o.id)).toEqual(["A", "B"]);
    expect(s.activeWorkspaceId).toBe("w1");
    expect(parseSession({ ...s, activeWorkspaceId: "not-mine", organization: s.organization })!.activeWorkspaceId).toBeNull();
  });

  it("stays on a page the new role allows, otherwise goes to the first allowed one", () => {
    expect(destinationAfterSwitch("/audit", [PERMISSIONS.auditRead])).toBeNull();
    expect(destinationAfterSwitch("/audit", [PERMISSIONS.overviewRead])).toBe("/overview");
    expect(destinationAfterSwitch("/audit", [])).toBe("/unauthorized");
    expect(destinationAfterSwitch("/audit", undefined)).toBeNull();
  });

  it("shows just the name for one organization", () => {
    render(<ToastProvider><OrganizationSwitcher /></ToastProvider>);
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("switches organization and leaves a page the new role can't open", async () => {
    session = { ...base, organizations: [...base.organizations, { id: "B", name: "Beta", role: "Viewer" }] };
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true, permissions: [PERMISSIONS.overviewRead] })));
    render(<ToastProvider><OrganizationSwitcher /></ToastProvider>);
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /Organization/ }), "B");
    expect(JSON.parse(spy.mock.calls[0][1]!.body as string)).toEqual({ id: "B" });
    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/overview"));
    spy.mockRestore();
  });
});
