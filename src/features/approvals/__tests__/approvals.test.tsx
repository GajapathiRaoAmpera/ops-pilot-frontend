import { fireEvent, render, screen, within } from "@testing-library/react";
import { SessionProvider } from "@/features/auth/components/SessionProvider";
import { PERMISSIONS } from "@/features/auth/permissions";
import type { Session } from "@/features/auth/types";
import { ApprovalsInbox } from "../components/ApprovalsInbox/ApprovalsInbox";

const session = (permissions: string[]): Session => ({
  user: { id: "u", email: "a@b.co", name: "A" },
  role: "Org Admin",
  organization: { id: "o", name: "Acme" },
  permissions,
});
const renderInbox = (permissions: string[]) =>
  render(<SessionProvider session={session(permissions)}><ApprovalsInbox /></SessionProvider>);

describe("ApprovalsInbox (mock)", () => {
  it("renders queue, SLA monitor, policy matrix and blast radius", () => {
    renderInbox([PERMISSIONS.approvalsDecide]);
    expect(screen.getByRole("list", { name: "Approval requests" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Governance SLA Monitor" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Policy & Separation of Duties/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Blast Radius/ })).toBeInTheDocument();
    expect(screen.getByText("18m 22s")).toBeInTheDocument();
  });

  it("filters by tab and sorts", () => {
    renderInbox([PERMISSIONS.approvalsDecide]);
    const list = () => screen.getByRole("list", { name: "Approval requests" });
    expect(within(list()).getAllByRole("listitem")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: /High Risk/ }));
    expect(within(list()).getAllByRole("listitem")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /Past History/ }));
    expect(screen.getByText(/Past history is not available/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /All/ }));
    fireEvent.change(screen.getByLabelText("Sort"), { target: { value: "oldest" } });
    expect(within(list()).getAllByRole("listitem")[0]).toHaveTextContent("REQ-8014");
  });

  it("keeps Approve/Reject disabled, and hides them without permission", () => {
    const { unmount } = renderInbox([PERMISSIONS.approvalsDecide]);
    expect(screen.getByRole("button", { name: /Approve/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Reject/ })).toBeDisabled();
    expect(screen.getByText(/not connected to a backend/)).toBeInTheDocument();
    unmount();
    renderInbox([PERMISSIONS.approvalsRead]);
    expect(screen.queryByRole("button", { name: /Approve/ })).not.toBeInTheDocument();
  });
});
