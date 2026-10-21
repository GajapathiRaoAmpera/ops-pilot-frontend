import { describe, expect, it } from "vitest";
import { matchesQuery, redactSecrets, splitHighlight } from "../log-safety";

describe("redactSecrets", () => {
  it("masks key=value secrets but keeps the key", () => {
    expect(redactSecrets("dump token=abc123def456 ok")).toBe("dump token=[REDACTED] ok");
    expect(redactSecrets("password: hunter2")).toBe("password: [REDACTED]");
  });
  it("masks bearer tokens, AWS keys and private keys", () => {
    expect(redactSecrets("Header Bearer abcdefghijkl123")).not.toContain("abcdefghijkl123");
    expect(redactSecrets("key AKIAABCDEFGHIJKLMNOP")).toBe("key [REDACTED]");
    expect(redactSecrets("-----BEGIN RSA PRIVATE KEY-----\nMIIB")).not.toContain("MIIB");
  });
  it("leaves ordinary lines untouched", () => {
    expect(redactSecrets("[INFO] 30 of 30 replicas ready")).toBe("[INFO] 30 of 30 replicas ready");
  });
});

describe("search helpers", () => {
  it("matches case-insensitively without regex interpretation", () => {
    expect(matchesQuery("Drain complete", "drain")).toBe(true);
    expect(matchesQuery("a.b", ".*")).toBe(false);
  });
  it("splits highlight segments as plain text", () => {
    expect(splitHighlight("<b>x</b> x", "x")).toEqual([
      { text: "<b>", hit: false }, { text: "x", hit: true }, { text: "</b> ", hit: false }, { text: "x", hit: true },
    ]);
  });
});
