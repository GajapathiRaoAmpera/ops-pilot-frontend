import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverviewView } from "../components/OverviewView/OverviewView";

describe("OverviewView (mock data)", () => {
  it("renders the key headings and regions", () => {
    render(<OverviewView />);
    expect(screen.getByRole("heading", { level: 1, name: "Overview Command Center" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Active CI\/CD/ })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: /Pipelines and services/ })).toBeInTheDocument();
    expect(screen.getByRole("log", { name: /Execution stream/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pending Approval Gates" })).toBeInTheDocument();
  });

  it("filters pipelines by health", async () => {
    render(<OverviewView />);
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: "Degraded" }));
    expect(screen.getByRole("button", { name: "Degraded" })).toHaveAttribute("aria-pressed", "true");
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(within(table).getByText("telemetry-gateway")).toBeInTheDocument();
  });

  it("filters the log excerpt to warnings", async () => {
    render(<OverviewView />);
    await userEvent.click(screen.getByLabelText("Warnings only"));
    const log = screen.getByRole("log");
    expect(within(log).getAllByText(/cgroup memory/)).toHaveLength(1);
    expect(within(log).queryByText(/Handshake confirmed/)).toBeNull();
  });

  it("disables every mutating action as not connected", () => {
    render(<OverviewView />);
    for (const name of [/Promote/, /Cancel/, /Rollback/, /Trigger Immediate Canary Rollback/, /Review & Authorize/, /New Deployment/, /Raw Trace/]) {
      const btn = screen.getAllByRole("button", { name })[0];
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute("title", expect.stringMatching(/not connected/i));
    }
  });
});
