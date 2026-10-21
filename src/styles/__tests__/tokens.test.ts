import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Guards every palette in _tokens.scss: a theme that fails contrast cannot be merged. */
const source = readFileSync(join(process.cwd(), "src/styles/_tokens.scss"), "utf8");

function themes(): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  const re = /"([a-z]+)": \(\n((?:\s+"[a-z-]+": #[0-9a-f]{6},\n)+)\s+\),/g;
  for (const m of source.matchAll(re)) {
    out[m[1]] = Object.fromEntries([...m[2].matchAll(/"([a-z-]+)": (#[0-9a-f]{6})/g)].map((x) => [x[1], x[2]]));
  }
  return out;
}

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

const ALL = themes();

describe("design tokens", () => {
  it("defines the expected palettes with every token", () => {
    expect(Object.keys(ALL).sort()).toEqual(["indigo", "ocean", "violet"]);
    const keys = Object.keys(ALL.indigo).sort();
    for (const t of Object.values(ALL)) expect(Object.keys(t).sort()).toEqual(keys);
  });

  it.each(Object.keys(ALL))("%s meets WCAG contrast on its own surfaces", (name) => {
    const t = ALL[name];
    const text = [["on-surface", 4.5], ["on-surface-variant", 4.5], ["outline", 4.5], ["primary", 4.5], ["secondary", 4.5],
      ["success", 4.5], ["warning", 4.5], ["error", 4.5]] as const;
    for (const surface of ["background", "surface-low", "surface-high"]) {
      for (const [token, min] of text) {
        expect(ratio(t[token], t[surface]), `${name}: ${token} on ${surface}`).toBeGreaterThanOrEqual(min);
      }
    }
    expect(ratio(t["on-primary-container"], t["primary-container"]), `${name}: button text`).toBeGreaterThanOrEqual(4.5);
    for (const surface of ["background", "surface-low"]) {
      expect(ratio(t["control-border"], t[surface]), `${name}: control border on ${surface}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps status colours identical across palettes, so status always means the same thing", () => {
    for (const k of ["success", "warning", "error"]) {
      expect(new Set(Object.values(ALL).map((t) => t[k])).size).toBe(1);
    }
  });
});
