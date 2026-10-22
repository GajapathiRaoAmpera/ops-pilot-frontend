import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "../../AppShell/AppShell";
import { NavLinks } from "@/features/auth/components/NavLinks/NavLinks";
import { SessionProvider } from "@/features/auth/components/SessionProvider";
import { NAV_ITEMS } from "@/features/auth/navigation";
import { PERMISSIONS } from "@/features/auth/permissions";
import type { Session } from "@/features/auth/types";

vi.mock("next/navigation", () => ({ usePathname: () => "/pipelines", useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));

const session: Session = {
  user: { id: "u", email: "a@b.co", name: "Ann" }, role: "Org Admin", organization: { id: "o", name: "A Very Long Organization Name Incorporated" },
  permissions: Object.values(PERMISSIONS).filter((p) => p !== PERMISSIONS.platformOrgs), workspaces: [], organizations: [], activeWorkspaceId: null, mustChangePassword: false,
};

const shell = () => render(
  <SessionProvider session={session}>
    <AppShell organizationName={session.organization.name} userName="Ann" userRole="Org Admin" nav={<NavLinks />} accountActions={<button>Sign out</button>}>
      <p>content</p>
    </AppShell>
  </SessionProvider>,
);

beforeEach(() => localStorage.clear());

describe("Sidebar", () => {
  it("starts expanded with an accessible collapse toggle", () => {
    shell();
    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-controls", "app-sidebar-panel");
    expect(document.getElementById("app-sidebar-panel")).toBeInTheDocument();
  });

  it("collapses to icons, keeps every link reachable by name, and remembers the choice", async () => {
    const user = userEvent.setup();
    const { unmount } = shell();
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(document.querySelector("aside")).toHaveAttribute("data-collapsed", "true");
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("link", { name: "Pipelines" })).toHaveAttribute("title", "Pipelines");
    expect(localStorage.getItem("opspilot-sidebar-collapsed")).toBe("1");
    unmount();
    shell();
    expect(document.querySelector("aside")).toHaveAttribute("data-collapsed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(document.querySelector("aside")).toHaveAttribute("data-collapsed", "false");
  });

  it("opens and closes the phone menu with an aria-expanded button", async () => {
    const user = userEvent.setup();
    shell();
    const menu = screen.getByRole("button", { name: /Menu/ });
    expect(menu).toHaveAttribute("aria-expanded", "false");
    await user.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector("aside")).toHaveAttribute("data-open", "true");
    await user.click(screen.getByRole("link", { name: "Settings" })); // choosing a page closes the menu
    expect(document.querySelector("aside")).toHaveAttribute("data-open", "false");
  });

  it("gives long organization and user names a tooltip instead of wrapping", () => {
    shell();
    expect(screen.getByText(session.organization.name)).toHaveAttribute("title", session.organization.name);
  });
});

describe("navigation labels", () => {
  it("are short enough for one line and each link carries its full name as a tooltip", () => {
    for (const item of NAV_ITEMS) expect(item.label.length, item.label).toBeLessThanOrEqual(20);
    shell();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    for (const link of within(nav).getAllByRole("link")) expect(link).toHaveAttribute("title");
  });
  it("section headings are single-line text with a tooltip", () => {
    shell();
    for (const h of screen.getAllByRole("heading", { level: 2 })) expect(h).toHaveAttribute("title", h.textContent ?? "");
  });
});
