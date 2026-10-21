import { findGateway, GATEWAYS } from "../gateways";

describe("gateways", () => {
  it("have unique slugs and resolve by slug", () => {
    expect(new Set(GATEWAYS.map((g) => g.slug)).size).toBe(GATEWAYS.length);
    expect(findGateway("auditor")?.title).toMatch(/Auditor/);
  });
  it("return undefined for unknown slugs (page 404s)", () => {
    expect(findGateway("root")).toBeUndefined();
    expect(findGateway("../admin")).toBeUndefined();
  });
});
