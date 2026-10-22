import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopilotView, reactTo } from "../components/CopilotView";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
const run = { id: "r1", repo: "acme/api", workflow: "CI", branch: "main", commit: "abc1234", conclusion: "failure", url: "https://github.com/x", startedAt: null };
const inv = {
  id: "i1", runId: "r1", summary: "The job timed out reaching the registry.", rootCause: "Network timeout", confidence: "medium",
  evidence: [{ quote: "Error: connect ETIMEDOUT", why: "network" }], evidenceVerified: true, nextSteps: ["Re-run"],
  suggestedAction: "rerun_failed_jobs", suggestionReason: "Looks transient.", model: "llama-3.3-70b-versatile",
  createdAt: "2026-10-22T10:00:00Z", createdBy: "Sri Ram",
};
/** Answers by URL, so the order of the screen's requests does not matter. */
function backend(routes: Record<string, () => unknown>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    const key = Object.keys(routes).find((k) => { const [m, part] = k.split(" "); return (init?.method ?? "GET") === m && url.includes(part); });
    return json(key ? routes[key]() : {});
  });
}
const ui = (canRequest = true) => render(<ToastProvider><CopilotView workspaceId="ws1" runs={[run]} connected canRequest={canRequest} /></ToastProvider>);

describe("CopilotView", () => {
  afterEach(() => vi.restoreAllMocks());

  it("investigates a failed run and shows the checked diagnosis with a request-for-approval button", async () => {
    const spy = backend({
      "GET investigations/status": () => ({ configured: true, provider: "groq", model: "openai/gpt-oss-120b" }),
      "GET investigations?": () => ({ investigations: [] }),
      "POST investigations": () => inv,
      "GET fix-proposals": () => ({ proposals: [] }),
    });
    ui();
    expect(await screen.findByText("Not investigated yet")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Investigate with AI/ }));
    const result = await screen.findByRole("article", { name: "AI investigation" });
    expect(within(result).getByText("Error: connect ETIMEDOUT")).toBeInTheDocument();
    expect(within(result).getByText("medium confidence")).toBeInTheDocument();
    expect(within(result).getByText("quotes verified in log")).toBeInTheDocument();
    expect(within(result).getByRole("button", { name: "Request re-run" })).toBeInTheDocument();
    const post = spy.mock.calls.find(([u, i]) => String(u).includes("investigations") && i?.method === "POST")!;
    expect(JSON.parse(post[1]!.body as string)).toEqual({ runId: "r1" });
    expect(screen.getByRole("button", { name: /Propose a fix/ })).toBeInTheDocument();
  });

  it("never offers the request button to someone without permission", async () => {
    backend({ "GET investigations/status": () => ({ configured: true, provider: "groq", model: "m" }), "GET investigations?": () => ({ investigations: [inv] }) });
    ui(false);
    await screen.findByRole("article", { name: "AI investigation" });
    expect(screen.queryByRole("button", { name: "Request re-run" })).not.toBeInTheDocument();
    expect(screen.getByText(/can't request re-runs/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Propose a fix/ })).not.toBeInTheDocument();
  });

  it("explains when the AI is not configured and disables the button", async () => {
    backend({ "GET investigations/status": () => ({ configured: false, provider: "groq", model: "m" }),
      "GET investigations?": () => ({ investigations: [] }), "GET fix-proposals": () => ({ proposals: [] }) });
    ui();
    expect(await screen.findByText(/OPSPILOT_GROQ_API_KEY/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Investigate with AI/ })).toBeDisabled();
  });
});

describe("Pilot's reaction", () => {
  const base = { ...inv, evidence: [{ quote: "x", why: "y" }] } as Parameters<typeof reactTo>[0];
  it("celebrates only a verified, high-confidence result", () => {
    expect(reactTo({ ...base, confidence: "high", evidenceVerified: true }).mood).toBe("success");
    expect(reactTo({ ...base, confidence: "high", evidenceVerified: false }).mood).toBe("worried");
    expect(reactTo({ ...base, confidence: "medium", evidenceVerified: true }).mood).toBe("curious");
    expect(reactTo({ ...base, confidence: "low", evidenceVerified: true }).mood).toBe("worried");
    expect(reactTo({ ...base, confidence: "high", evidenceVerified: true, evidence: [] }).mood).toBe("worried");
  });
});
