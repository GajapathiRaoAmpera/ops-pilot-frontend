"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Loader } from "@/components/ui/Loader/Loader";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { Table } from "@/components/ui/Table/Table";
import { TextField } from "@/components/ui/TextField/TextField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { callBackend, messageFor, referenceFor } from "@/lib/backend-client";
import styles from "./GithubConnection.module.scss";

interface Repo { id: string; repo: string; ownToken: boolean; lastSyncedAt: string | null }
interface Status { connected: boolean; tokenSet: boolean; maxRepositories: number; lastSyncedAt: string | null; repositories: Repo[] }
interface TestResult { repo: string; ok: boolean; reason?: string }

const TEST_REASONS: Record<string, string> = {
  no_token: "No token: set the workspace token or give this repository its own.",
  unauthorized: "GitHub rejected the token (expired or revoked).",
  forbidden: "The token lacks permission for this repository.",
  repo_not_found_or_no_access: "Repository not found, or the token cannot see it.",
  error: "GitHub could not be reached or returned an error.",
};
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "Never");

/** Tokens are write-only: sent once, never displayed again, and the fields are cleared after saving. */
export function GithubConnection({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const base = `workspaces/${workspaceId}/integrations/github`;
  const { notify } = useToast();
  const [status, setStatus] = useState<Status | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sharedToken, setSharedToken] = useState("");
  const [newRepo, setNewRepo] = useState("");
  const [newToken, setNewToken] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editToken, setEditToken] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [formError, setFormError] = useState<{ where: string; text: string } | null>(null);
  const [tests, setTests] = useState<Record<string, TestResult>>({});

  const apply = useCallback((s: Status) => { setStatus(s); setLoadError(null); }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await callBackend<Status>("GET", base);
      if (cancelled) return;
      if (r.ok) apply(r.data); else setLoadError(messageFor(r.detail));
    })();
    return () => { cancelled = true; };
  }, [base, apply]);

  async function run<T>(key: string, where: string, fn: () => ReturnType<typeof callBackend<T>>) {
    if (busy) return null;
    setBusy(key); setFormError(null);
    const r = await fn();
    setBusy(null);
    if (!r.ok) { setFormError({ where, text: messageFor(r.detail) }); return null; }
    return r.data;
  }

  async function saveShared(e: FormEvent) {
    e.preventDefault();
    if (!sharedToken.trim()) return setFormError({ where: "shared", text: "Paste a token first." });
    const s = await run<Status>("shared", "shared", () => callBackend<Status>("PUT", base, { token: sharedToken }));
    if (!s) return;
    setSharedToken(""); apply(s);
    notify({ tone: "success", title: "Workspace token saved", message: "It is stored encrypted and will not be shown again." });
  }

  async function addRepo(e: FormEvent) {
    e.preventDefault();
    if (!newRepo.trim()) return setFormError({ where: "add", text: "Enter a repository as owner/name." });
    const s = await run<Status>("add", "add", () => callBackend<Status>("POST", `${base}/repositories`, { repo: newRepo.trim(), token: newToken || null }));
    if (!s) return;
    notify({ tone: "success", title: "Repository added", message: `${newRepo.trim()} is now tracked. Sync Pipelines to load its runs.` });
    setNewRepo(""); setNewToken(""); apply(s);
  }

  async function saveOwnToken(repo: Repo) {
    if (!editToken.trim()) return setFormError({ where: repo.id, text: "Paste a token first." });
    const s = await run<Status>(`own:${repo.id}`, repo.id, () => callBackend<Status>("PUT", `${base}/repositories/${repo.id}`, { token: editToken }));
    if (!s) return;
    setEditing(null); setEditToken(""); apply(s);
    notify({ tone: "success", title: "Token saved", message: `${repo.repo} now uses its own token.` });
  }

  async function switchToShared(repo: Repo) {
    const s = await run<Status>(`shared:${repo.id}`, repo.id, () => callBackend<Status>("PUT", `${base}/repositories/${repo.id}`, { useSharedToken: true }));
    if (!s) return;
    apply(s);
    notify({ tone: "success", title: "Using the workspace token", message: `${repo.repo}'s own token was deleted.` });
  }

  async function removeRepo(repo: Repo) {
    if (!window.confirm(`Stop tracking ${repo.repo}? Runs already synced stay in the history.`)) return;
    const s = await run<Status>(`rm:${repo.id}`, repo.id, () => callBackend<Status>("DELETE", `${base}/repositories/${repo.id}`));
    if (!s) return;
    apply(s);
    notify({ tone: "success", title: "Repository removed", message: `${repo.repo} is no longer tracked.` });
  }

  async function testAll() {
    if (busy) return;
    setBusy("test");
    const r = await callBackend<{ ok: boolean; results?: TestResult[] }>("POST", `${base}/test`, {});
    setBusy(null);
    if (!r.ok) return notify({ tone: "error", title: "Could not run the test", message: messageFor(r.detail), reference: referenceFor(r) });
    const results = r.data.results ?? [];
    setTests(Object.fromEntries(results.map((x) => [x.repo, x])));
    const bad = results.filter((x) => !x.ok).length;
    if (bad === 0) notify({ tone: "success", title: "All repositories reachable", message: `GitHub accepted the token for ${results.length} ${results.length === 1 ? "repository" : "repositories"}.` });
    else notify({ tone: "error", title: `${bad} of ${results.length} repositories failed`, message: "See the Test column for each one." });
  }

  async function disconnect() {
    if (!window.confirm("Disconnect GitHub for this workspace? All tokens are deleted and no repository is tracked. Synced runs stay in the history.")) return;
    setBusy("disconnect");
    const r = await callBackend("DELETE", base);
    setBusy(null);
    if (!r.ok) return notify({ tone: "error", title: "Could not disconnect", message: messageFor(r.detail), reference: referenceFor(r) });
    setTests({});
    apply({ connected: false, tokenSet: false, maxRepositories: status?.maxRepositories ?? 50, lastSyncedAt: null, repositories: [] });
    notify({ tone: "success", title: "GitHub disconnected", message: "All stored tokens were deleted." });
  }

  const repos = status?.repositories ?? [];
  const errorFor = (where: string) => (formError?.where === where ? <p role="alert" className={styles.error}>{formError.text}</p> : null);
  const badge = !status ? null : !status.connected ? <StatusBadge tone="warning">not connected</StatusBadge>
    : <StatusBadge tone="success">{`${repos.length} ${repos.length === 1 ? "repository" : "repositories"}`}</StatusBadge>;

  return (
    <Card title={`GitHub Actions · ${workspaceName}`} info="The GitHub token and repositories OpsPilot uses for this workspace. Tokens are stored encrypted and never shown again." actions={badge} flush>
      {loadError ? <div className={styles.pad}><Notice variant="error">{loadError}</Notice></div> : !status ? <Loader /> : (
        <div className={styles.sections}>
          <section className={styles.section} aria-labelledby="gh-shared">
            <div className={styles.sectionHead}>
              <h3 id="gh-shared">Workspace token</h3>
              <StatusBadge tone={status.tokenSet ? "success" : "neutral"} icon={status.tokenSet ? undefined : ""}>{status.tokenSet ? "set" : "not set"}</StatusBadge>
            </div>
            <p className={styles.hint}>Used by every repository that has no token of its own. A fine-grained token needs Actions: Read (runs and logs). Add Actions: Read and write for approved re-runs, and Contents plus Pull requests: Read and write for AI fix pull requests.</p>
            <form onSubmit={saveShared} className={styles.row} noValidate>
              <TextField id="gh-shared-token" label={status.tokenSet ? "Replace workspace token" : "Workspace token"} type="password"
                value={sharedToken} onChange={(e) => setSharedToken(e.target.value)} autoComplete="off" maxLength={512} />
              <Button type="submit" loading={busy === "shared"} disabled={busy !== null}>Save token</Button>
            </form>
            {errorFor("shared")}
          </section>

          <section className={styles.section} aria-labelledby="gh-repos">
            <div className={styles.sectionHead}>
              <h3 id="gh-repos">Repositories <span className={styles.count}>{repos.length} of {status.maxRepositories}</span></h3>
              <Button variant="ghost" loading={busy === "test"} disabled={busy !== null || repos.length === 0} onClick={() => void testAll()}>Test all</Button>
            </div>
            {repos.length === 0 ? (
              <EmptyState icon="folder_open" title="No repositories yet">Add the first repository below. You can track as many as this workspace needs.</EmptyState>
            ) : (
              <div className={styles.tableWrap}>
                <Table caption="Tracked repositories">
                  <thead><tr><th scope="col">Repository</th><th scope="col">Token</th><th scope="col">Last synced</th><th scope="col">Test</th><th scope="col">Actions</th></tr></thead>
                  <tbody>
                    {repos.map((r) => {
                      const t = tests[r.repo];
                      return (
                        <tr key={r.id}>
                          <td className={styles.mono}>{r.repo}</td>
                          <td><StatusBadge tone={r.ownToken ? "info" : "neutral"} icon={r.ownToken ? "key" : "link"}>{r.ownToken ? "own token" : "workspace token"}</StatusBadge></td>
                          <td>{when(r.lastSyncedAt)}</td>
                          <td>{!t ? <span className={styles.hint}>-</span> : t.ok ? <StatusBadge tone="success">reachable</StatusBadge>
                            : <span title={TEST_REASONS[t.reason ?? "error"]}><StatusBadge tone="error">{(t.reason ?? "error").replaceAll("_", " ")}</StatusBadge></span>}</td>
                          <td>
                            {editing === r.id ? (
                              <div className={styles.inlineEdit}>
                                <input aria-label={`Token for ${r.repo}`} type="password" className={styles.input} value={editToken} autoComplete="off" maxLength={512}
                                  placeholder="Paste token" onChange={(e) => setEditToken(e.target.value)} />
                                <Button className={styles.small} loading={busy === `own:${r.id}`} disabled={busy !== null} onClick={() => void saveOwnToken(r)}>Save</Button>
                                <Button variant="ghost" className={styles.small} onClick={() => { setEditing(null); setEditToken(""); }}>Cancel</Button>
                              </div>
                            ) : (
                              <div className={styles.actions}>
                                <Button variant="ghost" className={styles.small} disabled={busy !== null} onClick={() => { setEditing(r.id); setEditToken(""); setFormError(null); }}>
                                  {r.ownToken ? "Replace token" : "Use own token"}
                                </Button>
                                {r.ownToken && <Button variant="ghost" className={styles.small} loading={busy === `shared:${r.id}`} disabled={busy !== null} onClick={() => void switchToShared(r)}>Use workspace token</Button>}
                                <Button variant="ghost" className={styles.small} loading={busy === `rm:${r.id}`} disabled={busy !== null} onClick={() => void removeRepo(r)}>Remove</Button>
                              </div>
                            )}
                            {errorFor(r.id)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}

            <form onSubmit={addRepo} className={styles.addForm} noValidate>
              <TextField id="gh-new-repo" label="Add repository (owner/name)" value={newRepo} onChange={(e) => setNewRepo(e.target.value)} maxLength={200} autoComplete="off" placeholder="acme/api" />
              <TextField id="gh-new-token" label="Own token (optional)" type="password" value={newToken} onChange={(e) => setNewToken(e.target.value)} maxLength={512} autoComplete="off" />
              <Button type="submit" loading={busy === "add"} disabled={busy !== null || repos.length >= status.maxRepositories}>Add repository</Button>
            </form>
            {errorFor("add")}
          </section>

          {status.connected && (
            <section className={styles.danger}>
              <div>
                <h3>Disconnect GitHub</h3>
                <p className={styles.hint}>Deletes every stored token and stops tracking all repositories. Synced runs and the audit trail are kept.</p>
              </div>
              <Button variant="ghost" loading={busy === "disconnect"} disabled={busy !== null} onClick={() => void disconnect()}>Disconnect</Button>
            </section>
          )}
        </div>
      )}
    </Card>
  );
}
