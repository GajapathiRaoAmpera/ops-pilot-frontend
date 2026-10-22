"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { DiffView } from "@/components/ui/DiffView/DiffView";
import { Icon } from "@/components/ui/Icon/Icon";
import { Loader } from "@/components/ui/Loader/Loader";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { callBackend, messageFor, referenceFor } from "@/lib/backend-client";
import type { FixProposal } from "../types";
import type { Pilot } from "./CopilotView";
import styles from "./CopilotView.module.scss";

/** The fix agent proposes; opening the pull request is a separate action that a different person must approve. */
export function FixPanel({ workspaceId, runId, disabled, onPilot }: {
  workspaceId: string; runId: string; disabled: boolean; onPilot?: (p: Pilot) => void;
}) {
  const base = `workspaces/${workspaceId}/fix-proposals`;
  const { notify } = useToast();
  const [proposals, setProposals] = useState<FixProposal[] | null>(null);
  const [busy, setBusy] = useState<"propose" | "request" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await callBackend<{ proposals: FixProposal[] }>("GET", `${base}?runId=${encodeURIComponent(runId)}`);
      if (!cancelled) setProposals(r.ok ? r.data.proposals : []);
    })();
    return () => { cancelled = true; };
  }, [base, runId]);

  async function propose() {
    setBusy("propose"); setError(null);
    onPilot?.({ mood: "thinking", line: "Reading the code for a small, safe fix…" });
    const r = await callBackend<FixProposal>("POST", base, { runId });
    setBusy(null);
    if (!r.ok) {
      setError(messageFor(r.detail));
      onPilot?.({ mood: "error", line: messageFor(r.detail) });
      return notify({ tone: "error", title: "The fix agent did not finish", message: messageFor(r.detail), reference: referenceFor(r) });
    }
    setProposals((p) => [r.data, ...(p ?? [])]);
    onPilot?.(r.data.status === "proposed"
      ? { mood: "success", line: "I have a fix. Review the diff before sending it for approval." }
      : { mood: "worried", line: "No safe code fix this time. My reason is below." });
    notify(r.data.status === "proposed"
      ? { tone: "success", title: "Fix proposed", message: "Review the change, then request approval to open a pull request." }
      : { tone: "info", title: "No safe fix found", message: "The agent explains why below." });
  }

  async function requestPr(p: FixProposal) {
    setBusy("request"); setError(null);
    const r = await callBackend("POST", `workspaces/${workspaceId}/action-requests`,
      { runId, type: "open_fix_pr", proposalId: p.id, reason: `AI fix: ${p.title}` });
    setBusy(null);
    if (!r.ok) { setError(messageFor(r.detail)); onPilot?.({ mood: "error", line: messageFor(r.detail) }); return; }
    setRequested(p.id);
    onPilot?.({ mood: "success", line: "Sent. Someone else approves it, then I'll open the pull request." });
    notify({ tone: "success", title: "Sent for approval", message: "No pull request is opened until someone other than you approves it in Approvals." });
  }

  const latest = proposals?.[0];
  return (
    <section className={styles.fix} aria-label="Fix proposal">
      <div className={styles.fixHead}>
        <div>
          <h3>Fix with a pull request</h3>
          <p className={styles.muted}>The agent reads the failing files and proposes a small change. Workflows, lockfiles and secrets are off limits.</p>
        </div>
        <Button variant="ghost" loading={busy === "propose"} disabled={busy !== null || disabled} onClick={() => void propose()}>
          <Icon name="build" size={18} />{latest ? "Propose again" : "Propose a fix"}
        </Button>
      </div>
      {error && <Notice variant="error">{error}</Notice>}
      {busy === "propose" ? <Loader label="The agent is reading the code… this can take up to two minutes." />
        : proposals === null ? <Loader />
        : !latest ? null
        : latest.status === "no_fix" ? (
          <div className={styles.noFix}><StatusBadge tone="neutral" icon="block">no safe fix</StatusBadge><p>{latest.explanation}</p></div>
        ) : (
          <div className={styles.proposalBody}>
            <p className={styles.proposalTitle}>{latest.title}</p>
            <p>{latest.explanation}</p>
            <DiffView diff={latest.diff} />
            <details className={styles.older}>
              <summary>What the agent did ({latest.trace.length} steps)</summary>
              <ol className={styles.steps}>{latest.trace.map((t, i) => <li key={i}><strong>{t.step.replaceAll("_", " ")}</strong>: {t.detail}</li>)}</ol>
            </details>
            <div className={styles.actionRow}>
              {requested === latest.id ? <StatusBadge tone="info" icon="schedule">awaiting approval</StatusBadge>
                : <Button loading={busy === "request"} disabled={busy !== null} onClick={() => void requestPr(latest)}>Request approval to open PR</Button>}
              <span className={styles.muted}>Base: {latest.baseBranch} @ {latest.baseSha} · {latest.model}</span>
            </div>
          </div>
        )}
    </section>
  );
}
