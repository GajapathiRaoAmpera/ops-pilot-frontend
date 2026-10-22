import { Card } from "@/components/ui/Card/Card";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { Table } from "@/components/ui/Table/Table";
import type { PipelineRun, RunsResult } from "../../server/runs";
import { RepoFilter } from "./RepoFilter";
import { RequestRerun, SyncButton } from "./RunControls";

function outcome(r: PipelineRun): { tone: Tone; label: string } {
  if (r.status !== "completed") return { tone: "accent", label: r.status.replace("_", " ") || "unknown" };
  if (r.conclusion === "success") return { tone: "success", label: "succeeded" };
  if (r.conclusion === "failure") return { tone: "error", label: "failed" };
  return { tone: "warning", label: r.conclusion ?? "completed" };
}

/** Real GitHub Actions data. Every value is rendered as plain text (React-escaped). */
export function RunsPanel({ result, workspaceId, canExecute = false, repo }: { result: RunsResult; workspaceId?: string; canExecute?: boolean; repo?: string }) {
  const controls = Boolean(workspaceId && canExecute);
  let body;
  if (result.state === "no-workspace") body = <Notice variant="info">No workspace is assigned to your account.</Notice>;
  else if (result.state === "forbidden") body = <Notice variant="error">You do not have access to this workspace&apos;s pipelines.</Notice>;
  else if (result.state === "error") body = <Notice variant="error">Pipeline data is temporarily unavailable.</Notice>;
  else if (!result.connected) body = <Notice variant="info">GitHub Actions is not connected for this workspace.</Notice>;
  else if (result.runs.length === 0) body = <Notice variant="info">{repo ? `No runs synced for ${repo} yet.` : "No runs have been synced yet."}</Notice>;
  else {
    body = (
      <Table caption="GitHub Actions runs">
        <thead>
          <tr><th scope="col">Workflow</th><th scope="col">Repository</th><th scope="col">Branch</th><th scope="col">Commit</th><th scope="col">Result</th>{controls && <th scope="col">Actions</th>}</tr>
        </thead>
        <tbody>
          {result.runs.map((r) => {
            const o = outcome(r);
            return (
              <tr key={r.id}>
                <td>{r.workflow}</td><td>{r.repo}</td><td>{r.branch}</td><td>{r.commit}</td>
                <td><StatusBadge tone={o.tone}>{o.label}</StatusBadge></td>
                {controls && <td>{o.label === "failed" && workspaceId ? <RequestRerun workspaceId={workspaceId} runId={r.id} /> : null}</td>}
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  }
  const synced = result.state === "ok" && result.lastSyncedAt ? `Last synced ${new Date(result.lastSyncedAt).toLocaleString()}` : undefined;
  const repos = result.state === "ok" ? result.repositories ?? [] : [];
  return (
    <Card title="GitHub Actions runs" flush actions={<>
      {repos.length > 1 && <RepoFilter repositories={repos} value={repo ?? ""} />}
      {synced ? <span>{synced}</span> : null}
      {controls && workspaceId ? <SyncButton workspaceId={workspaceId} /> : null}
    </>}>
      {body}
    </Card>
  );
}
