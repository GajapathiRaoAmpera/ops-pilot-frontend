import { act, render } from "@testing-library/react";
import { Parallax } from "../Parallax";

function media(fine: boolean, reduced: boolean) {
  window.matchMedia = ((q: string) => ({ matches: q.includes("pointer: fine") ? fine : q.includes("reduce") ? reduced : false })) as unknown as typeof window.matchMedia;
}
const frame = () => act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));

function ui() {
  const { container } = render(
    <Parallax className="page">
      <section data-tilt="5" data-testid="card"><input aria-label="email" /></section>
    </Parallax>,
  );
  const root = container.firstElementChild as HTMLElement;
  const card = root.querySelector("section") as HTMLElement;
  card.getBoundingClientRect = () => ({ left: 100, top: 100, width: 400, height: 300, right: 500, bottom: 400, x: 100, y: 100, toJSON() {} });
  return { root, card };
}

describe("Parallax", () => {
  beforeEach(() => { Object.assign(window, { innerWidth: 1000, innerHeight: 800 }); });

  it("turns the pointer position into depth and tilt variables", async () => {
    media(true, false);
    const { root, card } = ui();
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 1000, clientY: 0 }));
    await frame();
    expect(root.style.getPropertyValue("--px")).toBe("1.000");
    expect(root.style.getPropertyValue("--py")).toBe("-1.000");
    expect(parseFloat(card.style.getPropertyValue("--ry"))).toBeGreaterThan(0);
    expect(root.dataset.parallax).toBe("on");
  });

  it("keeps a card flat while someone types in it", async () => {
    media(true, false);
    const { card } = ui();
    act(() => card.querySelector("input")!.focus());
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 1000, clientY: 0 }));
    await frame();
    expect(card.style.getPropertyValue("--ry")).toBe("0.00deg");
  });

  it.each([[false, false, "touch"], [true, true, "reduced motion"]])("does nothing for %s/%s (%s)", async (fine, reduced) => {
    media(fine, reduced);
    const { root } = ui();
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 1000, clientY: 0 }));
    await frame();
    expect(root.style.getPropertyValue("--px")).toBe("");
    expect(root.dataset.parallax).toBeUndefined();
  });
});
