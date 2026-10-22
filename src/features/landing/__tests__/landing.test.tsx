import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Landing } from "../components/Landing";
import { STORY, stepAt } from "../story";

describe("landing page", () => {
  it("leads with the product promise and a way to sign in", () => {
    render(<Landing />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Every failed run explained.");
    const signIns = screen.getAllByRole("link", { name: "Sign in" });
    expect(signIns.length).toBeGreaterThan(0);
    signIns.forEach((a) => expect(a).toHaveAttribute("href", "/login"));
  });

  it("lets people step through the story without the 3D scene", () => {
    render(<Landing />);
    const steps = within(screen.getByRole("list", { name: "How a failed run gets fixed" })).getAllByRole("button");
    expect(steps).toHaveLength(STORY.length);
    expect(steps[0]).toHaveAttribute("aria-current", "step");
    fireEvent.click(steps[3]);
    expect(steps[3]).toHaveAttribute("aria-current", "step");
    expect(screen.getAllByText(STORY[3].detail).length).toBeGreaterThan(0);
  });

  it("shows the role matrix as a real table", () => {
    render(<Landing />);
    const table = screen.getByRole("table");
    expect(within(table).getByRole("rowheader", { name: "Approve requests" })).toBeInTheDocument();
    expect(within(table).getAllByRole("columnheader")).toHaveLength(7);
  });

  it("gives Pilot something to say about each section and row", () => {
    const { container } = render(<Landing />);
    expect(container.querySelectorAll("[data-pilot-line]")).toHaveLength(4);
    const row = within(screen.getByRole("table")).getByRole("rowheader", { name: "Approve requests" }).closest("tr");
    expect(row).toHaveAttribute("data-pilot-say", "Approve requests: organization admin and workspace admin.");
  });

  it("maps animation time to story steps", () => {
    expect(stepAt(0)).toBe(0);
    expect(stepAt(STORY[2].at + 0.1)).toBe(2);
    expect(stepAt(15.9)).toBe(STORY.length - 1);
  });
});
