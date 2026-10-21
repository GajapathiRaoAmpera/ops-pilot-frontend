"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { useSession } from "@/features/auth/components/SessionProvider";
import { cx } from "@/lib/cx";
import { callBackend, messageFor } from "@/lib/backend-client";
import inbox from "../components/ApprovalsInbox/ApprovalsInbox.module.scss";
import type { LiveRequest } from "./types";

const STATUS_TONE: Record<string, Tone> = { pending: "warning", approved: "info", executing: "accent", succeeded: "success", failed: "error", rejected: "neutral" };
const RISK_TONE: Record<string, Tone> = { high: "error", medium: "warning", low: "neutral" };
type Tab = "pending" | "history" | "all";

/** Real approvals. A status is shown only as the backend reports it; nothing is optimistic. */
export function LiveApprovals({ workspaceId, canDecide }: { workspaceId: string; canDecide: boolean }) {
  const me = useSession()?.user.email.toLowerCase();
  const [rows, setRows] = useState<LiveRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await callBackend<{ requests: LiveRequest[] }>("GET", `workspaces/${workspaceId}/approvals`);
      if (cancelled) return;
      if (r.ok) { setRows(r.data.requests); setError(null); } else setError(messageFor(r.detail));
    })();
    return () => { cancelled = true; };
  }, [workspaceId, tick]);

  const shown = useMemo(() => (rows ?? []).filter((r) => (tab === "all" ? true : tab === "pending" ? r.status === "pending" : r.status !== "pending")), [rows, tab]);
  const selected = shown.find((r) => r.id === selectedId) ?? shown[0];
  const pendingCount = (rows ?? []).filter((r) => r.status === "pending").length;

  async function decide(decision: "approve" | "reject") {
    if (!selected || busy) return;
    if (!window.confirm(decision === "approve" ? "Approve and run this action now?" : "Reject this request?")) return;
    setBusy(true); setError(null); setNotice(null);
    const r = await callBackend<LiveRequest>("POST", `workspaces/${workspaceId}/approvals/${selected.id}/decision`, { decision, reason });
    setBusy(false);
    if (!r.ok) return setError(messageFor(r.detail));
    setReason("");
    setNotice(decision === "reject" ? "Request rejected." : r.data.status === "succeeded" ? "Approved. GitHub accepted the re-run request." : r.data.status === "failed" ? `Approved, but the action failed: ${r.data.execution?.error || "unknown error"}.` : `Approved. Status: ${r.data.status}.`);
    setTick((t) => t + 1);
  }

  const own = selected && me && selected.requester?.email.toLowerCase() === me;

  return (
    <div className={inbox.layout}>
      <div className={inbox.queue}>
        <Card title="Approval requests" flush>
          <div role="group" aria-label="Queue filter" className={inbox.tabs}>
            {([["pending", `Pending (${pendingCount})`], ["history", "History"], ["all", "All"]] as const).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={tab === id} className={cx(inbox.tab, tab === id && inbox.tabOn)} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
          {rows === null && !error ? <p className={inbox.empty}>Loading…</p>
            : shown.length === 0 ? <p className={inbox.empty}>{tab === "pending" ? "Nothing is waiting for approval." : "No requests to show."}</p>
            : (
              <ul className={inbox.list} aria-label="Approval requests">
                {shown.map((r) => (
                  <li key={r.id}>
                    <button type="button" aria-pressed={r.id === selected?.id} className={cx(inbox.item, r.id === selected?.id && inbox.active)} onClick={() => setSelectedId(r.id)}>
                      <span className={inbox.row}>
                        <span className={inbox.id}>Re-run failed jobs</span>
                        <StatusBadge tone={RISK_TONE[r.risk] ?? "neutral"}>{`${r.risk} risk`}</StatusBadge>
                      </span>
                      <span className={inbox.itemTitle}>{r.run ? `${r.run.workflow} · ${r.run.repo}` : "Unknown run"}</span>
                      <span className={inbox.meta}>{r.requester?.name ?? "Unknown"} · {new Date(r.createdAt).toLocaleString()}</span>
                      <span className={inbox.meta}><StatusBadge tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status}</StatusBadge></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </Card>
      </div>

      <div className={inbox.queue}>
        {error && <Notice variant="error">{error}</Notice>}
        {notice && <Notice variant="info">{notice}</Notice>}
        {!selected ? <Card><p className={inbox.empty}>Select a request to inspect it.</p></Card> : (
          <>
            <Card title="Request">
              <p className={inbox.itemTitle}>Re-run failed jobs</p>
              {selected.run && <p className={inbox.meta}>{selected.run.repo} · workflow “{selected.run.workflow}” · branch {selected.run.branch} · commit {selected.run.commit} · run {selected.run.conclusion ?? selected.run.status}</p>}
              <p className={inbox.meta}>Requested by {selected.requester?.name ?? "unknown"} ({selected.requester?.email ?? "-"}) on {new Date(selected.createdAt).toLocaleString()}</p>
              <p className={inbox.meta}>Reason: {selected.reason || "none given"}</p>
              <p className={inbox.meta}><StatusBadge tone={STATUS_TONE[selected.status] ?? "neutral"}>{selected.status}</StatusBadge></p>
            </Card>

            {selected.decision && (
              <Card title="Decision">
                <p className={inbox.meta}>{selected.decision.decision === "approve" ? "Approved" : "Rejected"} by {selected.decision.decidedByName ?? "unknown"} on {new Date(selected.decision.decidedAt).toLocaleString()}</p>
                <p className={inbox.meta}>Reason: {selected.decision.reason || "none given"}</p>
              </Card>
            )}

            {selected.execution && (
              <Card title="Execution">
                <p className={inbox.meta}><StatusBadge tone={STATUS_TONE[selected.execution.status] ?? "neutral"}>{selected.execution.status}</StatusBadge></p>
                {selected.execution.error && <p className={inbox.meta}>Error: {selected.execution.error}</p>}
                {typeof selected.execution.result.observedStatus === "string" && <p className={inbox.meta}>Run status reported by GitHub afterwards: {selected.execution.result.observedStatus}</p>}
                {selected.execution.endedAt && <p className={inbox.meta}>Finished {new Date(selected.execution.endedAt).toLocaleString()}</p>}
              </Card>
            )}

            {selected.status === "pending" && (
              <Card title="Your decision">
                {!canDecide ? <p className={inbox.meta}>You can view this request but do not have permission to decide it.</p>
                  : own ? <p className={inbox.meta}>You made this request, so someone else must approve it.</p>
                  : (
                    <>
                      <label className={inbox.meta} htmlFor="decision-reason">Reason (optional)</label>
                      <input id="decision-reason" value={reason} maxLength={1000} onChange={(e) => setReason(e.target.value)} style={{ width: "100%", margin: "0.5rem 0" }} />
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Button loading={busy} disabled={busy} onClick={() => void decide("approve")}>Approve &amp; run</Button>
                        <Button variant="ghost" disabled={busy} onClick={() => void decide("reject")}>Reject</Button>
                      </div>
                    </>
                  )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
