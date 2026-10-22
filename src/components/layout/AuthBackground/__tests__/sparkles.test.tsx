import { render } from "@testing-library/react";
import { AuthBackground } from "../AuthBackground";
import { makeSparkles } from "../sparkles";

describe("sign-in sparkles", () => {
  it("are deterministic, so server and browser render the same markup", () => {
    expect(makeSparkles()).toEqual(makeSparkles());
  });

  it("mostly stay out of the middle where the forms are", () => {
    const s = makeSparkles();
    const central = s.filter((p) => p.left > 22 && p.left < 78 && p.top > 18 && p.top < 85);
    expect(central.length / s.length).toBeLessThan(0.2);
  });

  it("are hidden from assistive technology and cannot be clicked", () => {
    const { container } = render(<AuthBackground />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.querySelectorAll("svg").length).toBe(makeSparkles().length);
  });
});
