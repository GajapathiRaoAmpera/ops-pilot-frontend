import { render, screen } from "@testing-library/react";
import { Can, SessionProvider } from "../components/SessionProvider";
import { NavLinks } from "../components/NavLinks/NavLinks";
import { PERMISSIONS } from "../permissions";
import type { Session } from "../types";

vi.mock("next/navigation", () => ({ usePathname: () => "/overview" }));

const session = (permissions: string[]): Session => ({
  user: { id: "u", email: "a@b.co", name: "A" },
  role: "Viewer",
  organization: { id: "o", name: "Acme" },
  permissions,
});

describe("permission-aware UI", () => {
  it("renders only permitted navigation links", () => {
    render(
      <SessionProvider session={session([PERMISSIONS.overviewRead, PERMISSIONS.auditRead])}>
        <NavLinks />
      </SessionProvider>,
    );
    expect(screen.getByRole("link", { name: /Overview Command Center/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Audit Trail/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /RBAC/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Approvals/ })).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing is permitted", () => {
    render(<SessionProvider session={session([])}><NavLinks /></SessionProvider>);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText(/No sections are available/)).toBeInTheDocument();
  });

  it("<Can> hides actions without the permission, and without any session", () => {
    const { rerender } = render(
      <SessionProvider session={session([PERMISSIONS.approvalsRead])}>
        <Can permission={PERMISSIONS.approvalsDecide}><button>Approve</button></Can>
      </SessionProvider>,
    );
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    rerender(<Can permission={PERMISSIONS.approvalsDecide}><button>Approve</button></Can>);
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    rerender(
      <SessionProvider session={session([PERMISSIONS.approvalsDecide])}>
        <Can permission={PERMISSIONS.approvalsDecide}><button>Approve</button></Can>
      </SessionProvider>,
    );
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });
});
