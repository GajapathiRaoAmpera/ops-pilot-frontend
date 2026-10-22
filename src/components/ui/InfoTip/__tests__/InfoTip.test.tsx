import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InfoTip } from "../InfoTip";

describe("InfoTip", () => {
  it("explains the feature on hover and hides it on leave", () => {
    render(<InfoTip title="Pipelines">Runs from every repository.</InfoTip>);
    const button = screen.getByRole("button", { name: "About Pipelines" });
    expect(screen.queryByRole("tooltip")).toBeNull();
    fireEvent.mouseEnter(button);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Runs from every repository.");
    expect(button).toHaveAttribute("aria-describedby", screen.getByRole("tooltip").id);
    fireEvent.mouseLeave(button);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("opens on keyboard focus and closes on Escape", () => {
    render(<InfoTip title="Audit">Every event.</InfoTip>);
    fireEvent.focus(screen.getByRole("button", { name: "About Audit" }));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("toggles on tap for touch screens", () => {
    render(<InfoTip title="Cloud">Read-only.</InfoTip>);
    const button = screen.getByRole("button", { name: "About Cloud" });
    fireEvent.click(button);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
