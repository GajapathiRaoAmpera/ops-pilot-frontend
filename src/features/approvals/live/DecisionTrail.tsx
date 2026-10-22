import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import type { LiveRequest } from "./types";
import styles from "./DecisionTrail.module.scss";

type State = "done" | "current" | "failed" | "skipped" | "todo";

interface Step { key: string; title: string; state: State; body: ReactNode }

const when = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString() : "");

/** Requested → Decided → Executed → Verified, derived only from what the backend has recorded. */
export function buildSteps(r: LiveRequest, decision: ReactNode): Step[] {
  const rejected = r.status === "rejected";
  const ex = r.execution;
  const observed = typeof ex?.result?.observedStatus === "string" ? (ex.result.observedStatus as string) : null;
  const prUrl = typeof ex?.result?.prUrl === "string" && ex.result.prUrl.startsWith("https://github.com/") ? ex.result.prUrl : null;
  if (r.type === "open_fix_pr") return fixSteps(r, decision, prUrl);
  return [
    {
      key: "requested", title: "Requested", state: "done",
      body: <>{r.requester?.name ?? "Someone"} asked to re-run the failed jobs on {when(r.createdAt)}. Reason: {r.reason || "none given"}.</>,
    },
    r.decision
      ? {
          key: "decision", title: rejected ? "Rejected" : "Approved", state: rejected ? "skipped" : "done",
          body: <>{r.decision.decidedByName ?? "Unknown"} on {when(r.decision.decidedAt)}. Reason: {r.decision.reason || "none given"}.</>,
        }
      : { key: "decision", title: "Decision", state: "current", body: decision },
    {
      key: "execution", title: "Executed",
      state: rejected ? "skipped" : ex ? (ex.status === "failed" ? "failed" : ex.status === "succeeded" ? "done" : "current") : "todo",
      body: rejected ? "Not run: the request was rejected."
        : ex ? (ex.status === "failed" ? <>GitHub did not accept it ({ex.error || "unknown error"}). Nothing was re-run.</>
          : ex.status === "succeeded" ? <>GitHub accepted the re-run on {when(ex.endedAt)}.</> : "Running now.")
        : "Runs right after approval.",
    },
    {
      key: "verified", title: "Verified",
      state: rejected || ex?.status === "failed" ? "skipped" : observed ? "done" : "todo",
      body: rejected || ex?.status === "failed" ? "Nothing to verify."
        : observed ? <>GitHub reports the run as <StatusBadge tone="info">{observed}</StatusBadge></> : "Checked after the action runs.",
    },
  ];
}

function fixSteps(r: LiveRequest, decision: ReactNode, prUrl: string | null): Step[] {
  const rejected = r.status === "rejected";
  const ex = r.execution;
  const pr = prUrl ? <a href={prUrl} target="_blank" rel="noreferrer noopener">pull request #{String(ex?.result?.prNumber ?? "")}</a> : null;
  return [
    { key: "requested", title: "Requested", state: "done",
      body: <>{r.requester?.name ?? "Someone"} asked to open a pull request with the AI-proposed fix on {when(r.createdAt)}. Reason: {r.reason || "none given"}.</> },
    r.decision
      ? { key: "decision", title: rejected ? "Rejected" : "Approved", state: rejected ? "skipped" : "done",
          body: <>{r.decision.decidedByName ?? "Unknown"} on {when(r.decision.decidedAt)}. Reason: {r.decision.reason || "none given"}.</> }
      : { key: "decision", title: "Decision", state: "current", body: decision },
    { key: "execution", title: "Pull request opened",
      state: rejected ? "skipped" : ex ? (ex.status === "failed" ? "failed" : ex.status === "succeeded" ? "done" : "current") : "todo",
      body: rejected ? "Not opened: the request was rejected."
        : ex ? (ex.status === "failed" ? <>GitHub did not accept it ({ex.error || "unknown error"}). No pull request was opened; an empty branch may remain.</>
          : ex.status === "succeeded" ? <>GitHub opened {pr ?? "the pull request"} on {when(ex.endedAt)}.</> : "Opening now.")
        : "Opens right after approval." },
    { key: "review", title: "Reviewed and merged in GitHub",
      state: rejected || ex?.status === "failed" ? "skipped" : ex?.status === "succeeded" ? "current" : "todo",
      body: rejected || ex?.status === "failed" ? "Nothing to review."
        : ex?.status === "succeeded" ? <>Waiting for a person to review and merge {pr ?? "it"} in GitHub. OpsPilot never merges.</>
        : "A person reviews the pull request in GitHub; CI runs on it." },
  ];
}

const LABEL: Record<State, string> = { done: "done", current: "waiting", failed: "failed", skipped: "not run", todo: "upcoming" };

export function DecisionTrail({ request, decision }: { request: LiveRequest; decision: ReactNode }) {
  const steps = buildSteps(request, decision);
  return (
    <ol className={styles.trail} aria-label="Decision trail">
      {steps.map((s) => (
        <li key={s.key} className={styles.step} data-state={s.state}>
          <span className={styles.node} aria-hidden="true" />
          <div className={styles.content}>
            <p className={styles.title}>{s.title} <span className={styles.state}>{LABEL[s.state]}</span></p>
            <div className={styles.body}>{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
