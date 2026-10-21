import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PipelinesView } from "../components/PipelinesView/PipelinesView";

describe("PipelinesView (mock)", () => {
  it("renders headings, cloud cards, and pipeline table", () => {
    render(<PipelinesView />);
    expect(screen.getByRole("heading", { level: 1, name: /Connected Clouds/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AWS Production Platform" })).toBeInTheDocument();
    expect(screen.getByText("3 REGISTERED")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.getByText("Mock snapshot")).toBeInTheDocument();
  });

  it("filters pipelines by status tab and search", async () => {
    const user = userEvent.setup();
    render(<PipelinesView />);
    await user.click(screen.getByRole("button", { name: /^Degraded/ }));
    const table = screen.getByRole("table");
    expect(within(table).getByText("telemetry-gateway")).toBeInTheDocument();
    expect(within(table).queryByText("api-gateway")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^All/ }));
    await user.type(screen.getByRole("searchbox"), "zzz-none");
    expect(screen.getByText(/No pipelines match/)).toBeInTheDocument();
  });

  it("filters by environment", async () => {
    const user = userEvent.setup();
    render(<PipelinesView />);
    await user.selectOptions(screen.getByLabelText(/Environment/), "staging");
    expect(screen.getByText(/No cloud accounts match/)).toBeInTheDocument();
    expect(screen.getByText("checkout-engine")).toBeInTheDocument();
  });

  it("disables every mutating action", () => {
    render(<PipelinesView />);
    for (const name of [/Sync Mesh Status/, /Connect New Cloud Provider/, /Promote 100%/, /Rollback/, /Renew Token/]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
  });

  it("collapses the connection wizard", async () => {
    const user = userEvent.setup();
    render(<PipelinesView />);
    await user.click(screen.getByRole("button", { name: /Hide connection steps/ }));
    expect(screen.queryByText("IAM Federation")).not.toBeInTheDocument();
  });
});
