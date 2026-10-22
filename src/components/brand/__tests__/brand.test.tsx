import { render, screen } from "@testing-library/react";
import { BrandMark, BrandWordmark } from "../BrandMark";

describe("BrandMark", () => {
  it("is hidden from assistive tech beside the wordmark", () => {
    const { container } = render(<><BrandMark /><BrandWordmark /></>);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("OpsPilot")).toBeInTheDocument();
  });
  it("is announced as an image when it stands alone", () => {
    render(<BrandMark label="OpsPilot" />);
    expect(screen.getByRole("img", { name: "OpsPilot" })).toBeInTheDocument();
  });
  it("gives each instance its own gradient id", () => {
    const { container } = render(<><BrandMark /><BrandMark /></>);
    const ids = [...container.querySelectorAll("linearGradient")].map((g) => g.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length); // no two logos share a gradient id
  });
});
