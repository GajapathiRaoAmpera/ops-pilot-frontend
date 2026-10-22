import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopilotView } from "../components/CopilotView";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const run = { id: "r1", repo: "acme/api", workflow: "CI", branch: "main", commit: "abc1234", conclusion: "failure", url: "https://github.com/x", startedAt: null };
const inv = {
  id: "i1", runId: "r1", summary: "The job timed out reaching the registry.", rootCause: "Network timeout", confidence: "medium",
  evidence: [{ quote: "Error: connect ETIMEDOUT", why: "network" }], evidenceVerified: true, nextSteps: ["Re-run"],
  suggestedAction: "rerun_failed_jobs", suggestionReason: "Looks transient.", model: "llama-3.3-70b-versatile",
  createdAt: "2026-10-22T10:00:00Z", createdBy: "Sri Ram",
};
const ui = (canRequest = true) => render(<ToastProvider><CopilotView workspaceId="ws1" runs={[run]} connected canRequest={canRequest} /></ToastProvider>);

describe("CopilotView", () => {
  afterEach(() => vi.restoreAllMocks());

  it("investigates a failed run and shows the checked diagnosis with a request-for-approval button", async () => {
    const spy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json({ configured: true, provider: "groq", model: "llama-3.3-70b-versatile" }))
      .mockResolvedValueOnce(json({ investigations: [] }))
      .mockResolvedValueOnce(json(inv));
    ui();
    expect(await screen.findByText("Not investigated yet")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Investigate with AI/ }));
    const result = await screen.findByRole("article", { name: "AI investigation" });
    expect(within(result).getByText("Error: connect ETIMEDOUT")).toBeInTheDocument();
    expect(within(result).getByText("medium confidence")).toBeInTheDocument();
    expect(within(result).getByText("quotes verified in log")).toBeInTheDocument();
    expect(within(result).getByRole("button", { name: "Request re-run" })).toBeInTheDocument();
    expect(JSON.parse(spy.mock.calls[2][1]!.body as string)).toEqual({ runId: "r1" });
  });

  it("never offers the request button to someone without permission", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json({ configured: true, provider: "groq", model: "m" }))
      .mockResolvedValueOnce(json({ investigations: [inv] }));
    ui(false);
    await screen.findByRole("article", { name: "AI investigation" });
    expect(screen.queryByRole("button", { name: "Request re-run" })).not.toBeInTheDocument();
    expect(screen.getByText(/can't request re-runs/)).toBeInTheDocument();
  });

  it("explains when the AI is not configured and disables the button", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json({ configured: false, provider: "groq", model: "m" }))
      .mockResolvedValueOnce(json({ investigations: [] }));
    ui();
    expect(await screen.findByText(/OPSPILOT_GROQ_API_KEY/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Investigate with AI/ })).toBeDisabled();
  });
});
