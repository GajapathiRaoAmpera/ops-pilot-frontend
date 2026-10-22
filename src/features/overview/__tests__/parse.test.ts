import { parseOverview } from "../parse";

describe("parseOverview", () => {
  it("accepts an older backend response that lacks the newer sections and hides them", () => {
    const old = { pipelines: { connected: true, counts: { failure: 1 }, total: 1, lastSyncedAt: null, recent: [] }, approvals: { pending: 2 }, lastExecution: null, notConnected: ["incidents"] };
    const parsed = parseOverview(old);
    expect(parsed).not.toBeNull();
    expect(parsed!.visible).toEqual({ approvals: false, executions: false, activity: false });
    expect(parsed!.approvals).toEqual({ pending: 2, items: [] });
    expect(parsed!.recentExecutions).toEqual([]);
    expect(parsed!.activity).toEqual([]);
  });
  it("keeps real data when present", () => {
    const parsed = parseOverview({
      pipelines: { connected: true, counts: {}, total: 0, lastSyncedAt: "2026-01-01T00:00:00Z", recent: [] },
      approvals: { pending: 1, items: [{ id: "a" }] }, recentExecutions: [{ id: "e" }], activity: [{ id: 1 }],
      visible: { approvals: true, executions: true, activity: true }, notConnected: [],
    });
    expect(parsed!.approvals.items).toHaveLength(1);
    expect(parsed!.visible.activity).toBe(true);
    expect(parsed!.pipelines.lastSyncedAt).toBe("2026-01-01T00:00:00Z");
  });
  it.each([null, "x", 5, {}, { pipelines: {} }, { approvals: {} }, { pipelines: "no", approvals: {} }])("rejects unusable payload %j", (bad) => {
    expect(parseOverview(bad)).toBeNull();
  });
  it("treats non-boolean visibility as hidden, not as allowed", () => {
    const parsed = parseOverview({ pipelines: {}, approvals: {}, visible: { approvals: "true", activity: 1 } });
    expect(parsed!.visible).toEqual({ approvals: false, executions: false, activity: false });
  });
});
