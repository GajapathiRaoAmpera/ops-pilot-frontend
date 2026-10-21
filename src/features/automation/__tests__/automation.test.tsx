import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutomationCenter } from "../components/AutomationCenter/AutomationCenter";

describe("AutomationCenter (mock)", () => {
  it("renders heading, stat chips, catalog, log and history", () => {
    render(<AutomationCenter />);
    expect(screen.getByRole("heading", { level: 1, name: /Automation Center/ })).toBeTruthy();
    expect(screen.getByText("100% ONLINE")).toBeTruthy();
    expect(screen.getByText("Running now")).toBeTruthy();
    expect(screen.getByText("Mock snapshot")).toBeTruthy();
    expect(screen.getByRole("table")).toBeTruthy();
  });

  it("filters runbooks by category and masks secrets in the log", () => {
    render(<AutomationCenter />);
    fireEvent.click(screen.getByRole("button", { name: /DATABASE/ }));
    expect(screen.queryByRole("heading", { name: "Zero-Downtime Rolling Restart" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Scale-Out Read Replica" })).toBeTruthy();
    expect(screen.queryByText(/abc123def456ghi789/)).toBeNull();
  });

  it("filters history by status", () => {
    render(<AutomationCenter />);
    fireEvent.change(screen.getByLabelText("Filter status"), { target: { value: "failed" } });
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(2);
  });

  it("keeps every run/abort/schedule/export control disabled", () => {
    render(<AutomationCenter />);
    for (const name of [/Schedule job/, /Import Ansible/, /New automation task/, /Request abort/, /Export CSV/]) {
      expect((screen.getByRole("button", { name }) as HTMLButtonElement).disabled).toBe(true);
    }
    for (const b of screen.getAllByRole("button", { name: /^Execute / })) expect((b as HTMLButtonElement).disabled).toBe(true);
  });
});
