"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Icon } from "@/components/ui/Icon/Icon";
import { Loader } from "@/components/ui/Loader/Loader";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { FixPanel } from "./FixPanel";
import { Robot, type RobotMood } from "@/features/auth/components/RobotAgent/Robot";
import { RequestRerun } from "@/features/pipelines/components/RunsPanel/RunControls";
import { callBackend, messageFor, referenceFor } from "@/lib/backend-client";
import { cx } from "@/lib/cx";
import type { FailedRun, Investigation } from "../types";
import styles from "./CopilotView.module.scss";

const PILOT_POKES = [
  "I read the log, quote the lines that matter, and check every quote is really there.",
  "I can suggest a re-run or a small code fix. A different person always approves it.",
  "Low confidence means I'm guessing. Check the evidence before acting.",
] as const;

export type Pilot = { mood: RobotMood; line: string | null };

/** Pilot's reaction to a finished investigation: driven only by what the backend returned. */
export function reactTo(inv: Investigation): Pilot {
  if (inv.confidence === "high" && inv.evidenceVerified && inv.evidence.length > 0) return { mood: "success", line: "Found it, and the log backs it up." };
  if (inv.confidence === "low" || !inv.evidenceVerified || inv.evidence.length === 0) {
    return { mood: "worried", line: "I'm not sure about this one. Treat it as a guess and check the log." };
  }
  return { mood: "curious", line: "Likely cause found. Check the quoted lines." };
}

const CONFIDENCE: Record<Investigation["confidence"], Tone> = { high: "success", medium: "warning", low: "neutral" };
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "-");

interface Props {
  workspaceId: string; runs: FailedRun[]; connected: boolean;
  /** Can run investigations (false: read-only reviewer such as a Security Auditor). */
  canInvestigate?: boolean;
  /** Can propose fixes and request actions. */
  canRequest: boolean;
}

/** Every word on this screen comes from the backend: the run list from GitHub, the diagnosis from the AI, checked. */
export function CopilotView({ workspaceId, runs, connected, canInvestigate = true, canRequest }: Props) {
  const base = `workspaces/${workspaceId}/investigations`;
  const { notify } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(runs[0]?.id ?? null);
  const [ai, setAi] = useState<{ configured: boolean; model: string } | null>(null);
  const [history, setHistory] = useState<Investigation[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = runs.find((r) => r.id === selectedId) ?? null;
  const [pilot, setPilot] = useState<Pilot>({ mood: "idle", line: runs.length ? "Pick a failed run and I'll read its log." : null });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await callBackend<{ configured: boolean; model: string }>("GET", `${base}/status`);
      if (!cancelled && r.ok) setAi(r.data);
    })();
    return () => { cancelled = true; };
  }, [base]);

  const loadHistory = useCallback(async (runId: string) => {
    const r = await callBackend<{ investigations: Investigation[] }>("GET", `${base}?runId=${encodeURIComponent(runId)}`);
    return r.ok ? r.data.investigations : [];
  }, [base]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    void loadHistory(selectedId).then((list) => { if (!cancelled) setHistory(list); });
    return () => { cancelled = true; };
  }, [selectedId, loadHistory]);

  function pick(id: string) {
    if (id === selectedId) return;
    setHistory(null); setError(null); setSelectedId(id);
    const run = runs.find((r) => r.id === id);
    setPilot({ mood: "curious", line: run ? `Let's look at ${run.workflow}.` : null });
  }

  async function investigate() {
    if (!selected || busy) return;
    setBusy(true); setError(null);
    setPilot({ mood: "thinking", line: "Reading the log…" });
    const r = await callBackend<Investigation>("POST", base, { runId: selected.id });
    setBusy(false);
    if (!r.ok) {
      setError(messageFor(r.detail));
      setPilot({ mood: "error", line: messageFor(r.detail) });
      return notify({ tone: "error", title: "Investigation failed", message: messageFor(r.detail), reference: referenceFor(r) });
    }
    setHistory((h) => [r.data, ...(h ?? [])]);
    setPilot(reactTo(r.data));
    notify({ tone: "success", title: "Investigation ready", message: `Confidence: ${r.data.confidence}. Check the quoted log lines before acting.` });
  }

  if (!connected) {
    return (
      <div className={styles.notConnected}>
        <Card title="Pilot" flush>
          <Robot mood="worried" line="Connect GitHub in Settings so I have runs to read." pokes={PILOT_POKES} className={styles.pilot} bubbleClassName={styles.pilotBubble} />
        </Card>
        <Card><EmptyState icon="link_off" title="GitHub is not connected" action={<Link className={styles.link} href="/settings">Open Settings</Link>}>Connect a repository so the Copilot has runs to investigate.</EmptyState></Card>
      </div>
    );
  }

  const latest = history?.[0];
  return (
    <div className={styles.layout}>
      <div className={styles.column}>
        <Card title="Pilot" info="Your AI assistant. It reacts to what you are looking at." flush className={styles.pilotCard}>
          <Robot mood={pilot.mood} line={pilot.line} pokes={PILOT_POKES} className={styles.pilot} bubbleClassName={styles.pilotBubble} />
        </Card>
        <Card title={`Failed runs (${runs.length})`} info="Failed pipeline runs from the last sync. Pick one and the AI reads its log to explain what went wrong." flush fill>
          {runs.length === 0 ? (
            <EmptyState icon="task_alt" title="No failed runs" action={<Link className={styles.link} href="/pipelines">Open Pipelines</Link>}>
              Nothing has failed in the synced runs. Sync Pipelines to check for new ones.
            </EmptyState>
          ) : (
            <ul className={styles.list} aria-label="Failed runs">
              {runs.map((r) => (
                <li key={r.id}>
                  <button type="button" aria-pressed={r.id === selectedId} className={cx(styles.item, r.id === selectedId && styles.active)} onClick={() => pick(r.id)}>
                    <span className={styles.itemTop}><span className={styles.itemTitle}>{r.workflow}</span><StatusBadge tone="error">{r.conclusion ?? "failed"}</StatusBadge></span>
                    <span className={styles.meta}>{r.repo} · {r.branch} · {r.commit}</span>
                    <span className={styles.meta}>{when(r.startedAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className={styles.column}>
        <Card flush fill>
          {!selected ? (
            <EmptyState icon="ads_click" title="Select a failed run">The AI reads that run&apos;s log and explains what went wrong.</EmptyState>
          ) : (
            <div className={styles.detail}>
              <header className={styles.head}>
                <div>
                  <h2 className={styles.headTitle}>{selected.workflow}</h2>
                  <p className={styles.meta}>{selected.repo} · branch {selected.branch} · commit <span className={styles.mono}>{selected.commit}</span>
                    {selected.url && <> · <a className={styles.ext} href={selected.url} target="_blank" rel="noreferrer noopener">Open on GitHub</a></>}</p>
                </div>
                {canInvestigate ? (
                  <Button loading={busy} disabled={busy || ai?.configured === false} onClick={() => void investigate()}>
                    <Icon name="auto_awesome" size={18} />{latest ? "Investigate again" : "Investigate with AI"}
                  </Button>
                ) : <StatusBadge tone="neutral" icon="visibility">read-only</StatusBadge>}
              </header>

              {canInvestigate && ai?.configured === false && <Notice variant="info">AI investigations are not set up on the server yet (OPSPILOT_GROQ_API_KEY).</Notice>}
              {error && <Notice variant="error">{error}</Notice>}

              {busy ? <Loader label="Reading the log and asking the AI… this can take up to a minute." />
                : history === null ? <Loader />
                : !latest ? (
                  <EmptyState icon="auto_awesome" title="Not investigated yet">
                    {canInvestigate
                      ? <>The run&apos;s log is redacted, trimmed to the error lines and sent to the AI{ai ? ` (${ai.model})` : ""}. Nothing is changed in GitHub.</>
                      : "Nobody has asked the AI about this run yet. Investigations appear here when someone runs one."}
                  </EmptyState>
                ) : <Result inv={latest} workspaceId={workspaceId} runId={selected.id} canRequest={canRequest} />}

              {!busy && history !== null && <FixPanel key={selected.id} workspaceId={workspaceId} runId={selected.id} disabled={ai?.configured === false} readOnly={!canRequest} onPilot={setPilot} />}

              {history && history.length > 1 && (
                <details className={styles.older}>
                  <summary>Earlier investigations ({history.length - 1})</summary>
                  <ul>{history.slice(1).map((h) => <li key={h.id}><span className={styles.meta}>{when(h.createdAt)} · {h.createdBy ?? "unknown"} · {h.confidence}</span><p>{h.summary}</p></li>)}</ul>
                </details>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Result({ inv, workspaceId, runId, canRequest }: { inv: Investigation; workspaceId: string; runId: string; canRequest: boolean }) {
  return (
    <article className={styles.result} aria-label="AI investigation">
      <div className={styles.badges}>
        <StatusBadge tone={CONFIDENCE[inv.confidence]} icon="insights">{`${inv.confidence} confidence`}</StatusBadge>
        <StatusBadge tone={inv.evidenceVerified ? "success" : "warning"} icon={inv.evidenceVerified ? "verified" : "rule"}>
          {inv.evidenceVerified ? "quotes verified in log" : "some quotes could not be verified"}
        </StatusBadge>
      </div>

      <section><h3>Summary</h3><p>{inv.summary}</p></section>
      {inv.rootCause && <section><h3>Likely cause</h3><p>{inv.rootCause}</p></section>}

      <section>
        <h3>Evidence from the log</h3>
        {inv.evidence.length === 0 ? <p className={styles.muted}>The AI could not point to a log line, so treat this diagnosis as a guess.</p> : (
          <ul className={styles.evidence}>
            {inv.evidence.map((e, i) => <li key={i}><code>{e.quote}</code>{e.why && <span>{e.why}</span>}</li>)}
          </ul>
        )}
      </section>

      {inv.nextSteps.length > 0 && <section><h3>Suggested next steps</h3><ol className={styles.steps}>{inv.nextSteps.map((s, i) => <li key={i}>{s}</li>)}</ol></section>}

      <section className={styles.suggest}>
        <h3>Suggested action</h3>
        {inv.suggestedAction === "rerun_failed_jobs" ? (
          <>
            <p>Re-run the failed jobs. {inv.suggestionReason}</p>
            {canRequest ? <div className={styles.actionRow}><RequestRerun workspaceId={workspaceId} runId={runId} /><span className={styles.muted}>Creates a request; someone else must approve it.</span></div>
              : <p className={styles.muted}>You can&apos;t request re-runs. Ask a DevOps engineer or administrator.</p>}
          </>
        ) : <p>No automatic action. {inv.suggestionReason || "This needs a fix in code, configuration or credentials."}</p>}
      </section>

      <p className={styles.foot}>AI-generated by {inv.model} for {inv.createdBy ?? "unknown"} on {new Date(inv.createdAt).toLocaleString()}. Check it before acting.</p>
    </article>
  );
}
