import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GithubConnection } from "../components/GithubConnection";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const repo = (name: string, ownToken = false) => ({ id: `id-${name}`, repo: name, ownToken, lastSyncedAt: null });
const status = (over = {}) => ({ connected: true, tokenSet: true, maxRepositories: 50, lastSyncedAt: null,
  repositories: [repo("acme/api"), repo("acme/web", true)], ...over });
const TOKEN = "ghp_" + "x".repeat(30);
const ui = () => render(<ToastProvider><GithubConnection workspaceId="ws1" workspaceName="Default" /></ToastProvider>);

describe("GithubConnection", () => {
  beforeEach(() => { vi.spyOn(window, "confirm").mockReturnValue(true); });
  afterEach(() => vi.restoreAllMocks());

  it("lists every repository with the token it uses, and never shows a token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json(status()));
    ui();
    const table = await screen.findByRole("table", { name: "Tracked repositories" });
    expect(within(table).getByText("acme/api")).toBeInTheDocument();
    expect(within(table).getByText("workspace token")).toBeInTheDocument();
    expect(within(table).getByText("own token")).toBeInTheDocument();
    expect(screen.getByText("2 of 50")).toBeInTheDocument();
    expect(screen.getByLabelText("Replace workspace token")).toHaveValue("");
  });

  it("saves the workspace token write-only and clears the field", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json(status())).mockResolvedValueOnce(json(status()));
    ui();
    const field = await screen.findByLabelText("Replace workspace token");
    expect(field).toHaveAttribute("type", "password");
    await userEvent.type(field, TOKEN);
    await userEvent.click(screen.getByRole("button", { name: "Save token" }));
    await screen.findByText(/stored encrypted and will not be shown again/);
    expect(field).toHaveValue("");
    expect(JSON.parse(spy.mock.calls[1][1]!.body as string)).toEqual({ token: TOKEN });
  });

  it("adds a repository with an optional own token", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json(status()))
      .mockResolvedValueOnce(json(status({ repositories: [repo("acme/api"), repo("acme/new", true), repo("acme/web", true)] })));
    ui();
    await userEvent.type(await screen.findByLabelText("Add repository (owner/name)"), "acme/new");
    await userEvent.type(screen.getByLabelText("Own token (optional)"), TOKEN);
    await userEvent.click(screen.getByRole("button", { name: "Add repository" }));
    expect(await screen.findByText("acme/new")).toBeInTheDocument();
    expect(spy.mock.calls[1][0]).toContain("integrations/github/repositories");
    expect(JSON.parse(spy.mock.calls[1][1]!.body as string)).toEqual({ repo: "acme/new", token: TOKEN });
    expect(screen.getByLabelText("Add repository (owner/name)")).toHaveValue("");
  });

  it("shows the test result per repository", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(json(status()))
      .mockResolvedValueOnce(json({ ok: false, reason: "unauthorized", results: [{ repo: "acme/api", ok: true }, { repo: "acme/web", ok: false, reason: "unauthorized" }] }));
    ui();
    await userEvent.click(await screen.findByRole("button", { name: "Test all" }));
    expect(await screen.findByText("1 of 2 repositories failed")).toBeInTheDocument();
    expect(screen.getByText("reachable")).toBeInTheDocument();
    expect(screen.getByText("unauthorized")).toBeInTheDocument();
  });

  it("explains a missing server key inline", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json(status({ connected: false, tokenSet: false, repositories: [] })))
      .mockResolvedValueOnce(json({ detail: "encryption_not_configured" }, 503));
    ui();
    expect(await screen.findByRole("button", { name: "Test all" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Workspace token", { selector: "input" }), TOKEN);
    await userEvent.click(screen.getByRole("button", { name: "Save token" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/OPSPILOT_SECRET_KEY/));
  });
});
