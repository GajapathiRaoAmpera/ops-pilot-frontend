import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { emitActivity } from "@/lib/activity";
import { PilotDock } from "../PilotDock";
import { helpFor, tipsFor } from "../page-help";

let path = "/approvals";
vi.mock("next/navigation", () => ({ usePathname: () => path }));
let permissions: string[] = [];
vi.mock("@/features/auth/components/SessionProvider", () => ({ useSession: () => ({ permissions }) }));

beforeEach(() => {
  path = "/approvals";
  permissions = ["approvals:requests:read", "approvals:requests:approve"];
  localStorage.clear();
  window.matchMedia = ((q: string) => ({ matches: q.includes("reduce") })) as unknown as typeof window.matchMedia; // still: no WebGL in tests
});

describe("PilotDock", () => {
  it("opens help for the current page and closes with Escape, returning focus", async () => {
    const user = userEvent.setup();
    render(<PilotDock />);
    const launcher = screen.getByRole("button", { name: "Open Pilot help" });
    await user.click(launcher);
    const panel = screen.getByRole("dialog", { name: "Pilot help" });
    expect(panel).toHaveTextContent("You can't approve your own request");
    expect(launcher).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(launcher).toHaveFocus();
  });

  it("counts real activity and lists it in Recent", async () => {
    const user = userEvent.setup();
    render(<PilotDock />);
    act(() => emitActivity({ tone: "success", title: "Pipelines synced" }));
    act(() => emitActivity({ tone: "error", title: "Sync failed" }));
    const launcher = screen.getByRole("button", { name: "Open Pilot help, 2 new" });
    await user.click(launcher);
    const recent = screen.getByRole("region", { name: "Recent activity" });
    expect(recent).toHaveTextContent("Sync failed");
    expect(recent).toHaveTextContent("Pipelines synced");
    expect(screen.getByRole("button", { name: "Open Pilot help" })).toBeInTheDocument(); // read
  });

  it("can be hidden, is remembered, and comes back from the edge tab", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<PilotDock />);
    await user.click(screen.getByRole("button", { name: "Open Pilot help" }));
    await user.click(screen.getByRole("button", { name: "Hide Pilot" }));
    expect(localStorage.getItem("opspilot-pilot-hidden")).toBe("1");
    unmount();
    render(<PilotDock />);
    await user.click(await screen.findByRole("button", { name: "Show Pilot" }));
    expect(screen.getByRole("button", { name: "Open Pilot help" })).toBeInTheDocument();
  });

  it("stays off the Copilot page, which has its own Pilot", () => {
    path = "/copilot";
    const { container } = render(<PilotDock />);
    expect(container).toBeEmptyDOMElement();
  });

  it("only promises what the person's role can do", () => {
    const pipelines = helpFor("/pipelines");
    const viewer = tipsFor(pipelines, ["cicd:pipelines:read"]).join(" ");
    const devops = tipsFor(pipelines, ["cicd:pipelines:read", "cicd:pipelines:execute"]).join(" ");
    expect(viewer).not.toMatch(/Sync now pulls/);
    expect(viewer).toMatch(/Syncing and re-runs are for/);
    expect(devops).toMatch(/Sync now pulls/);
    expect(devops).not.toMatch(/Syncing and re-runs are for/);
  });

  it("has help for nested paths and a fallback", () => {
    expect(helpFor("/settings").title).toBe("Settings");
    expect(helpFor("/pipelines/x").title).toBe("Pipelines");
    expect(helpFor("/unknown").title).toBe("OpsPilot");
  });
});
