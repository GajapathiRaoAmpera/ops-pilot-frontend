import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GithubConnection } from "../components/GithubConnection";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const status = (over = {}) => ({ connected: true, repo: "acme/api", tokenSet: true, lastSyncedAt: null, ...over });

describe("GithubConnection", () => {
  beforeEach(() => { vi.spyOn(window, "confirm").mockReturnValue(true); });
  afterEach(() => vi.restoreAllMocks());

  it("never shows a stored token and clears the field after saving", async () => {
    const spy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json(status()))
      .mockResolvedValueOnce(json(status()))
      .mockResolvedValue(json(status()));
    render(<GithubConnection workspaceId="ws1" workspaceName="Default" />);
    const token = await screen.findByLabelText(/Replace token/);
    expect(token).toHaveValue("");
    expect(token).toHaveAttribute("type", "password");
    await userEvent.type(token, "ghp_" + "x".repeat(30));
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByText(/stored encrypted and will not be shown again/);
    expect(screen.getByLabelText(/Replace token/)).toHaveValue("");
    expect(JSON.parse(spy.mock.calls[1][1]!.body as string)).toEqual({ repo: "acme/api", token: "ghp_" + "x".repeat(30) });
  });

  it("shows a coarse reason when the test fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json(status())).mockResolvedValueOnce(json({ ok: false, reason: "unauthorized" }));
    render(<GithubConnection workspaceId="ws1" workspaceName="Default" />);
    await userEvent.click(await screen.findByRole("button", { name: "Test connection" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/rejected the token/);
  });

  it("explains a missing server key and keeps Test/Disconnect disabled when not connected", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json(status({ connected: false, repo: null, tokenSet: false })))
      .mockResolvedValueOnce(json({ detail: "encryption_not_configured" }, 503));
    render(<GithubConnection workspaceId="ws1" workspaceName="Default" />);
    expect(await screen.findByRole("button", { name: "Test connection" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Repository (owner/name)"), "acme/api");
    await userEvent.click(screen.getByRole("button", { name: "Connect" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/OPSPILOT_SECRET_KEY/));
  });
});
