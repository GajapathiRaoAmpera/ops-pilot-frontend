import { isGuardBypassed } from "../dev-bypass";

afterEach(() => vi.unstubAllEnvs());

describe("isGuardBypassed", () => {
  it("is off by default", () => {
    vi.stubEnv("OPSPILOT_AUTH_GUARD", "");
    expect(isGuardBypassed()).toBe(false);
  });
  it("is on only in non-production with the flag", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("OPSPILOT_AUTH_GUARD", "off");
    expect(isGuardBypassed()).toBe(true);
  });
  it("can never be enabled in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("OPSPILOT_AUTH_GUARD", "off");
    expect(isGuardBypassed()).toBe(false);
  });
});
