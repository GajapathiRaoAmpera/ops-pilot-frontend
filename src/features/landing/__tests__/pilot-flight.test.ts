import { describe, expect, it } from "vitest";
import { flightTarget } from "../pilot-flight";

const box = { w: 144, h: 176 };

describe("Pilot's flight plan", () => {
  it("flies in the margin beside the column on wide screens, on the section's side", () => {
    const right = flightTarget(1600, 900, box, { top: 0, height: 900, side: "right" });
    const left = flightTarget(1600, 900, box, { top: 0, height: 900, side: "left" });
    const column = { from: (1600 - 1152) / 2, to: (1600 + 1152) / 2 };
    expect(right.x).toBeGreaterThanOrEqual(column.to);
    expect(left.x + box.w).toBeLessThanOrEqual(column.from);
    expect(left.side).toBe("left");
  });

  it("drifts down as the section is read", () => {
    const start = flightTarget(1600, 900, box, { top: 450, height: 1200, side: "right" });
    const end = flightTarget(1600, 900, box, { top: -750, height: 1200, side: "right" });
    expect(end.y).toBeGreaterThan(start.y);
  });

  it("keeps to a bottom corner on phones and stays on screen", () => {
    const t = flightTarget(390, 844, { w: 112, h: 136 }, { top: -2000, height: 1000, side: "left" });
    expect(t.x).toBe(12);
    expect(t.y + 136).toBeLessThanOrEqual(844);
    expect(t.y).toBeGreaterThan(844 / 2);
  });
});
