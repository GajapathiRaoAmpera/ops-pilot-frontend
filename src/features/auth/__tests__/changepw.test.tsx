import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh: vi.fn() }) }));

import { ChangePassword } from "../components/ChangePassword/ChangePassword";
import { parseSession } from "../session-parser";

const fill = async (user: ReturnType<typeof userEvent.setup>, cur: string, nw: string, conf: string) => {
  await user.type(screen.getByLabelText(/temporary password|current password/i), cur);
  await user.type(screen.getByLabelText("New password"), nw);
  await user.type(screen.getByLabelText("Confirm new password"), conf);
  await user.click(screen.getByRole("button", { name: /Update password/ }));
};

describe("ChangePassword", () => {
  beforeEach(() => replace.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it("checks length and match locally without calling the backend", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<ChangePassword forced />);
    await fill(user, "temp-pass", "short", "short");
    expect(screen.getByRole("alert")).toHaveTextContent(/at least 12/);
    expect(spy).not.toHaveBeenCalled();
  });

  it("navigates onward only after the backend confirms", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    const user = userEvent.setup();
    render(<ChangePassword forced />);
    await fill(user, "temp-pass", "a-long-new-password", "a-long-new-password");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it("stays put and explains a wrong current password", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response('{"detail":"invalid_credentials"}', { status: 401 }));
    const user = userEvent.setup();
    render(<ChangePassword forced={false} />);
    await fill(user, "wrong", "a-long-new-password", "a-long-new-password");
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/current password is incorrect/));
    expect(replace).not.toHaveBeenCalled();
  });
});

describe("session parsing", () => {
  it("reads mustChangePassword strictly", () => {
    const base = { user: { id: "1", email: "a@b.co", name: "A" }, role: "R", organization: { id: "o", name: "O" }, permissions: [] };
    expect(parseSession({ ...base, mustChangePassword: true })?.mustChangePassword).toBe(true);
    expect(parseSession({ ...base, mustChangePassword: "true" })?.mustChangePassword).toBe(false);
    expect(parseSession(base)?.mustChangePassword).toBe(false);
  });
});
