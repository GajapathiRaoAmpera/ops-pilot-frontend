import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RbacScreen } from "../components/RbacScreen/RbacScreen";

describe("RbacScreen (mock)", () => {
  it("renders heading, scope bar, roles and matrix", () => {
    render(<RbacScreen />);
    expect(screen.getByRole("heading", { level: 1, name: /Role-Based Access Control/ })).toBeInTheDocument();
    expect(screen.getByText("Acme Corp Global")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(7);
    expect(screen.getByRole("table", { name: /permission matrix/i })).toBeInTheDocument();
    expect(screen.getByText(/Displaying 7 of 24/)).toBeInTheDocument();
  });

  it("switches role tabs", async () => {
    render(<RbacScreen />);
    await userEvent.click(screen.getByRole("tab", { name: /Viewer/ }));
    expect(screen.getByRole("tab", { name: /Viewer/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText(/No permission matrix is available/)).toBeInTheDocument();
  });

  it("filters destructive rows and toggles conditions", async () => {
    render(<RbacScreen />);
    const rowsBefore = within(screen.getByRole("table")).getAllByRole("row").length;
    await userEvent.click(screen.getByRole("button", { name: /Filter: Destructive Only/ }));
    expect(within(screen.getByRole("table")).getAllByRole("row").length).toBeLessThan(rowsBefore);
    expect(screen.queryByText("Organizations & Workspaces")).not.toBeInTheDocument();
    expect(screen.getByText("Production Rollback & Failover")).toBeInTheDocument();

    expect(screen.queryByText(/Destructive steps require approval/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Expand All Conditions/ }));
    expect(screen.getByText(/Destructive steps require approval/)).toBeInTheDocument();
  });

  it("keeps every mutating action disabled", () => {
    render(<RbacScreen />);
    for (const name of [/Audit Log Export/, /Simulate Policy/, /Create Custom Role/, /Run Attestation/, /Discard Draft/, /Save Changes/]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
  });
});
