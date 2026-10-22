import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import { TeamView } from "../components/TeamView";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const catalog = {
  roles: [{ key: "org_admin", label: "Organization Administrator" }, { key: "workspace_admin", label: "Workspace Administrator" },
    { key: "devops_engineer", label: "DevOps Engineer" }, { key: "developer", label: "Developer" }, { key: "viewer", label: "Viewer" }],
  workspaceRoles: ["workspace_admin", "devops_engineer", "developer", "viewer"],
  wsAdminGrantable: ["devops_engineer", "developer", "viewer"],
};
const member = { membershipId: "m1", userId: "u1", email: "a@x.test", name: "Ann", role: "viewer", roleLabel: "Viewer", workspaceId: null, workspace: null, disabled: false };

function mockApi() {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);
    if (url.endsWith("/meta/roles")) return json(catalog);
    if (url.endsWith("/org/members")) return json({ members: [member] });
    if (url.endsWith("/org/workspaces")) return json({ workspaces: [{ id: "w1", name: "Default Workspace" }] });
    if (url.endsWith("/org/invitations")) return json({ invitations: [] });
    if (url.includes("/members")) return json({ members: [member] });
    return json({}, 404);
  });
}
const view = (orgAdmin: boolean) => render(<ToastProvider><TeamView orgAdmin={orgAdmin} workspaces={[{ id: "w1", name: "Default Workspace" }]} /></ToastProvider>);

afterEach(() => vi.restoreAllMocks());

describe("TeamView role pickers", () => {
  it("take role names and the grantable sets from the server, not from the page", async () => {
    mockApi();
    view(true);
    const select = await screen.findByLabelText("Role");
    await waitFor(() => expect(within(select).getAllByRole("option")).toHaveLength(5));
    expect(within(select).getByRole("option", { name: "Organization Administrator" })).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Access scope"), "w1"); // one workspace: org-wide-only roles disappear
    expect(within(select).getAllByRole("option").map((o) => o.textContent)).toEqual(["Workspace Administrator", "DevOps Engineer", "Developer", "Viewer"]);
  });

  it("offers a workspace admin only the roles the server says they may grant", async () => {
    mockApi();
    view(false);
    const select = await screen.findByLabelText("Role");
    await waitFor(() => expect(within(select).getAllByRole("option")).toHaveLength(3));
    expect(within(select).queryByRole("option", { name: /Administrator/ })).toBeNull();
  });

  it("keeps the invite button disabled until the role catalog has loaded", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => String(input).endsWith("/meta/roles") ? json({ detail: "unavailable" }, 503) : json({ members: [], workspaces: [], invitations: [] }));
    view(true);
    expect(await screen.findByRole("button", { name: "Create invitation" })).toBeDisabled();
  });
});
