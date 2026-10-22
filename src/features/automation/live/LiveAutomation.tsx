"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Icon } from "@/components/ui/Icon/Icon";
import { LoaderRows } from "@/components/ui/Loader/Loader";
import { Notice } from "@/components/ui/Notice/Notice";
import { Segmented } from "@/components/ui/Segmented/Segmented";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { Table } from "@/components/ui/Table/Table";
import type { LiveRequest } from "@/features/approvals/live/types";
import styles from "./LiveAutomation.module.scss";
import { callBackend, messageFor } from "@/lib/backend-client";

const TONE: Record<string, Tone> = { succeeded: "success", failed: "error", executing: "accent" };
const FILTERS = [
  { value: "", label: "All" }, { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" }, { value: "executing", label: "Running" },
] as const;
const when = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString() : "-");

/** Built-in actions are the server's allowlist. Today there is exactly one. */
const ACTIONS = [
  {
    name: "Re-run failed jobs",
    what: "Restarts only the failed jobs of a failed GitHub Actions run. Nothing in the code changes.",
    rule: "Needs approval from someone other than the requester. Runs only after approval, and the result is recorded.",
    icon: "replay",
  },
  {
    name: "Open fix pull request",
    what: "Opens a pull request with a small code change proposed by the AI fix agent from AI Copilot. Never merges.",
    rule: "High risk. Needs approval from someone else, who sees the exact diff. A person still reviews and merges it in GitHub.",
    icon: "merge",
  },
] as const;

export function LiveAutomation({ workspaceId }: { workspaceId: string }) {
  const [rows, setRows] = useState<LiveRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const q = status ? `?status=${status}` : "";
      const r = await callBackend<{ executions: LiveRequest[] }>("GET", `workspaces/${workspaceId}/executions${q}`);
      if (cancelled) return;
      setFetching(false);
      if (r.ok) { setRows(r.data.executions); setError(null); } else setError(messageFor(r.detail));
    })();
    return () => { cancelled = true; };
  }, [workspaceId, status]);

  const choose = (v: string) => { setFetching(true); setStatus(v); };
  const loading = rows === null && !error;
  const refreshing = fetching && rows !== null;

  return (
    <div className={styles.page}>
      <Card title="Available actions" info="The only actions OpsPilot can take. Each one needs approval from a second person before it runs.">
        <div className={styles.actions}>
          {ACTIONS.map((a) => (
            <div key={a.name} className={styles.action}>
              <span className={styles.actionHead}><span className={styles.actionIcon}><Icon name={a.icon} size={20} /></span>{a.name}</span>
              <p className={styles.what}>{a.what}</p>
              <p className={styles.rule}><Icon name="verified_user" size={14} />{a.rule}</p>
            </div>
          ))}
        </div>
        <p className={styles.more}>More actions and integrations will appear here as they are added.</p>
      </Card>

      {error && <Notice variant="error">{error}</Notice>}

      <div className={styles.history}>
        <Card
          title={`Automation history${rows && !status ? ` (${rows.length})` : ""}`} flush fill="clip"
          actions={
            <div className={styles.syncing}>
              {refreshing && <><span className={styles.spin} aria-hidden="true" />Updating…</>}
              <Segmented label="Filter by result" value={status} onChange={choose} options={FILTERS} />
            </div>
          }
        >
          {loading ? <LoaderRows />
            : rows && rows.length === 0 ? (
              status
                ? <EmptyState icon="filter_alt_off" title="No runs match this filter" action={<Button variant="ghost" onClick={() => choose("")}>Show all results</Button>}>Try another result, or show everything.</EmptyState>
                : <EmptyState icon="history" title="Nothing has run yet">When an approved request executes, it is listed here with who asked, who approved and what GitHub reported.</EmptyState>
            ) : rows && (
              <Table caption="Automation history" tall>
                <thead><tr><th scope="col">When</th><th scope="col">Run</th><th scope="col">Requested by</th><th scope="col">Approved by</th><th scope="col">Result</th><th scope="col">Detail</th></tr></thead>
                <tbody className={refreshing ? styles.fading : undefined}>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{when(r.execution?.endedAt ?? r.createdAt)}</td>
                      <td>{r.run ? <>{r.run.workflow}<br /><span className={styles.hint}>{r.run.repo} · {r.run.branch}</span></> : "-"}</td>
                      <td>{r.requester?.name ?? "-"}</td>
                      <td>{r.decision?.decidedByName ?? "-"}</td>
                      <td><StatusBadge tone={TONE[r.execution?.status ?? ""] ?? "neutral"}>{r.execution?.status ?? r.status}</StatusBadge></td>
                      <td className={styles.detail}>
                        {typeof r.execution?.result?.prUrl === "string" && r.execution.result.prUrl.startsWith("https://github.com/")
                          ? <a className={styles.link} href={r.execution.result.prUrl} target="_blank" rel="noreferrer noopener">Pull request #{String(r.execution.result.prNumber ?? "")}</a>
                          : r.execution?.error
                          ? <>GitHub did not accept it ({r.execution.error})</>
                          : typeof r.execution?.result?.observedStatus === "string" ? <>GitHub reports the run as {r.execution.result.observedStatus as string}</> : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
        </Card>
      </div>
    </div>
  );
}
