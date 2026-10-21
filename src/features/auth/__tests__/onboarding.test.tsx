import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PERMISSIONS } from "../permissions";
import { landingPath, visibleNavItems } from "../navigation";
import { AcceptInvite, type InvitePreview } from "@/features/invitations/components/AcceptInvite";

describe("navigation for onboarding roles", () => {
  it("platform admins see only Organizations and land there", () => {
    const perms = [PERMISSIONS.platformOrgs];
    expect(visibleNavItems(perms).map((i) => i.href)).toEqual(["/platform"]);
    expect(landingPath(perms)).toBe("/platform");
  });
  it("Team & Access opens for org admins or workspace admins, not for others", () => {
    expect(visibleNavItems([PERMISSIONS.membersManage]).map((i) => i.href)).toContain("/team");
    expect(visibleNavItems([PERMISSIONS.wsMembersManage]).map((i) => i.href)).toContain("/team");
    expect(visibleNavItems([PERMISSIONS.overviewRead, PERMISSIONS.pipelinesRead]).map((i) => i.href)).not.toContain("/team");
  });
});

const preview = (over: Partial<InvitePreview> = {}): InvitePreview => ({
  kind: "invite", email: "a@acme.test", organization: "Acme", workspace: null, role: "Viewer", accountExists: false, ...over,
});

describe("AcceptInvite", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows an invalid-link message without leaking details", () => {
    render(<AcceptInvite token="t" preview={null} signedInEmail={null} />);
    expect(screen.getByRole("heading", { name: /Link not valid/ })).toBeInTheDocument();
  });

  it("validates password locally before calling the backend", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<AcceptInvite token="t" preview={preview()} signedInEmail={null} />);
    await user.type(screen.getByLabelText("Your name"), "Ann");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.type(screen.getByLabelText("Confirm password"), "short");
    await user.click(screen.getByRole("button", { name: /Create my account/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(/at least 12/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("only claims success after the backend confirms", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const user = userEvent.setup();
    render(<AcceptInvite token="t" preview={preview()} signedInEmail={null} />);
    await user.type(screen.getByLabelText("Your name"), "Ann");
    await user.type(screen.getByLabelText("Password"), "correct-horse-battery");
    await user.type(screen.getByLabelText("Confirm password"), "correct-horse-battery");
    await user.click(screen.getByRole("button", { name: /Create my account/ }));
    await waitFor(() => expect(screen.getByText("Account ready")).toBeInTheDocument());
    expect(fetchSpy).toHaveBeenCalledWith("/api/backend/invitations/accept", expect.objectContaining({ method: "POST" }));
  });

  it("shows the backend refusal instead of success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ detail: "invalid_or_expired" }), { status: 404 }));
    const user = userEvent.setup();
    render(<AcceptInvite token="t" preview={preview({ kind: "reset" })} signedInEmail={null} />);
    await user.type(screen.getByLabelText("Password"), "correct-horse-battery");
    await user.type(screen.getByLabelText("Confirm password"), "correct-horse-battery");
    await user.click(screen.getByRole("button", { name: /Set new password/ }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/invalid, expired/));
  });

  it("asks existing accounts to sign in as the invited user", () => {
    render(<AcceptInvite token="t" preview={preview({ accountExists: true })} signedInEmail="someone@else.test" />);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Accept invitation/ })).toBeNull();
  });
});
