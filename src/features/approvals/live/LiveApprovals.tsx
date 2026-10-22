"use client";
import { LoaderRows } from "@/components/ui/Loader/Loader";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { useSession } from "@/features/auth/components/SessionProvider";
import { cx } from "@/lib/cx";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { callBackend, messageFor } from "@/lib/backend-client";
import inbox from "./Inbox.module.scss";
import { DecisionTrail } from "./DecisionTrail";
import styles from "./LiveApprovals.module.scss";
import type { LiveRequest } from "./types";

const STATUS_TONE: Record<string, Tone> = { pending: "warning", approved: "info", executing: "accent", succeeded: "success", failed: "error", rejected: "neutral" };
const RISK_TONE: Record<string, Tone> = { high: "error", medium: "warning", low: "neutral" };
type Tab = "pending" | "history" | "all";

/** Real approvals. A status is shown only as the backend reports it; nothing is optimistic. */
export function LiveApprovals({ workspaceId, canDecide }: { workspaceId: string; canDecide: boolean }) {
  const me = useSession()?.user.email.toLowerCase();
  const [rows, setRows] = useState<LiveRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();
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
    setBusy(true); setError(null);
    const r = await callBackend<LiveRequest>("POST", `workspaces/${workspaceId}/approvals/${selected.id}/decision`, { decision, reason });
    setBusy(false);
    if (!r.ok) return setError(messageFor(r.detail));
    setReason("");
    if (decision === "reject") notify({ tone: "info", title: "Request rejected", message: "Nothing was run." });
    else if (r.data.status === "succeeded") notify({ tone: "success", title: "Approved and executed", message: "GitHub accepted the re-run request." });
    else if (r.data.status === "failed") notify({ tone: "error", title: "Approved, but the action failed", message: "GitHub did not accept the re-run. Nothing was re-run.", reference: r.data.execution?.error || "unknown" });
    else notify({ tone: "info", title: "Approved", message: `Status: ${r.data.status}.` });
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
          {rows === null && !error ? <LoaderRows />
            : shown.length === 0 ? (tab === "pending"
              ? <EmptyState title="Nothing is waiting for approval">Requests appear here when someone asks to re-run a failed pipeline. Open Pipelines to request one.</EmptyState>
              : <EmptyState title="No requests yet">Approved, rejected and executed requests are kept here as a record.</EmptyState>)
            : (
              <ul className={inbox.list} aria-label="Approval requests">
                {shown.map((r) => (
                  <li key={r.id}>
                    <button type="button" aria-pressed={r.id === selected?.id} className={cx(inbox.item, styles.bar, r.id === selected?.id && inbox.active)} data-status={r.status} onClick={() => setSelectedId(r.id)}>
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
        {!selected ? <Card><EmptyState title="Select a request">Pick one from the list to see who asked, who decided and what happened.</EmptyState></Card> : (
          <Card flush>
            <div className={styles.detail}>
              <div className={styles.head}>
                <h2 className={styles.headTitle}>Re-run failed jobs</h2>
                {selected.run && (
                  <p className={styles.facts}>
                    <span>{selected.run.repo}</span>
                    <span>workflow “{selected.run.workflow}”</span>
                    <span>branch {selected.run.branch} · commit <span className={styles.mono}>{selected.run.commit}</span></span>
                    <span>run {selected.run.conclusion ?? selected.run.status}</span>
                  </p>
                )}
                <div className={styles.badges}>
                  <StatusBadge tone={STATUS_TONE[selected.status] ?? "neutral"}>{selected.status}</StatusBadge>
                  <StatusBadge tone={RISK_TONE[selected.risk] ?? "neutral"}>{`${selected.risk} risk`}</StatusBadge>
                </div>
              </div>
              <DecisionTrail
                request={selected}
                decision={
                  !canDecide ? <>You can view this request but do not have permission to decide it.</>
                  : own ? <>You made this request, so someone else must approve it.</>
                  : (
                    <div className={styles.decide}>
                      <p>Waiting for you. Nothing runs until you approve.</p>
                      <label className={styles.label} htmlFor="decision-reason">Reason (optional)</label>
                      <input id="decision-reason" className={styles.input} value={reason} maxLength={1000} onChange={(e) => setReason(e.target.value)} />
                      <div className={styles.actions}>
                        <Button loading={busy} disabled={busy} onClick={() => void decide("approve")}>Approve &amp; run</Button>
                        <Button variant="ghost" disabled={busy} onClick={() => void decide("reject")}>Reject</Button>
                      </div>
                    </div>
                  )
                }
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
