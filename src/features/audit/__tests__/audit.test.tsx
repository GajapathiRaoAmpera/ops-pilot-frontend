import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AuditLedger } from "../components/AuditLedger/AuditLedger";

const rowCount = () => within(screen.getByRole("table")).getAllByRole("row").length - 1;

describe("AuditLedger (mock)", () => {
  it("renders KPIs, filters, table and mock labels", () => {
    render(<AuditLedger />);
    expect(screen.getByText("48,219")).toBeInTheDocument();
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByText(/Mock snapshot/)).toBeInTheDocument();
    expect(screen.getByText(/Mock label: SHA256 Verified/)).toBeInTheDocument();
    expect(rowCount()).toBe(5); // default 30d range hides the 400h row
  });

  it("filters by severity, search and date range, then resets", async () => {
    const user = userEvent.setup();
    render(<AuditLedger />);
    await user.selectOptions(screen.getByLabelText("Severity"), "critical");
    expect(rowCount()).toBe(1);
    await user.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(rowCount()).toBe(5);
    await user.selectOptions(screen.getByLabelText("Date range"), "24h");
    expect(rowCount()).toBe(3);
    await user.type(screen.getByLabelText("Search"), "zzz-nothing");
    expect(screen.getByText(/No mock events match/)).toBeInTheDocument();
  });

  it("shows mock diff for a selected row", async () => {
    const user = userEvent.setup();
    render(<AuditLedger />);
    await user.click(screen.getByRole("button", { name: "corr-8812a" }));
    expect(screen.getByText(/checkout-api:v2.8.7/)).toBeInTheDocument();
  });

  it("keeps mutating and paging actions disabled", () => {
    render(<AuditLedger />);
    for (const name of [/Simulate Query/, /Export audit bundle/, /Pause stream/, "Previous", "Next"]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
    expect(screen.getAllByText("Not connected").length).toBe(2);
  });
});
