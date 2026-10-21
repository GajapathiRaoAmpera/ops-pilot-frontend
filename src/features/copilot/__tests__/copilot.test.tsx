import { render, screen, within } from "@testing-library/react";
import { CopilotView } from "../components/CopilotView/CopilotView";

describe("CopilotView (mock)", () => {
  it("renders the h1 and panel landmarks", () => {
    render(<CopilotView />);
    expect(screen.getByRole("heading", { level: 1, name: /AI SRE Sentinel/ })).toBeInTheDocument();
    for (const name of ["Telemetry", "Cluster Topology", "Autonomous Investigation Log", "Mitigation Options", "Copilot Session"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByText("Ingress")).toBeInTheDocument();
    expect(screen.getByText(/pod-3 \(CRIT\)/)).toBeInTheDocument();
  });

  it("disables every apply control and chat input with not-connected text", () => {
    render(<CopilotView />);
    for (const key of ["A", "B", "C"]) {
      expect(screen.getByRole("button", { name: `Apply suggestion ${key}` })).toBeDisabled();
    }
    expect(screen.getAllByText(/Not connected to a backend/).length).toBeGreaterThanOrEqual(3);
    expect(screen.getByLabelText("Message to Copilot")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Send message/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Export Diagnostic Report/ })).toBeDisabled();
  });

  it("labels recommendations as suggestions that were not executed", () => {
    render(<CopilotView />);
    expect(screen.getByText(/Suggestions, not executed/)).toBeInTheDocument();
    expect(screen.getByText(/None has been applied/)).toBeInTheDocument();
    expect(screen.queryByText(/\bLIVE\b/i)).not.toBeInTheDocument();
    expect(screen.getAllByText("Mock snapshot").length).toBeGreaterThan(0);
    const list = screen.getByRole("list", { name: /Sample transcript/ });
    expect(within(list).getByText(/AI suggestion:/)).toBeInTheDocument();
  });
});
