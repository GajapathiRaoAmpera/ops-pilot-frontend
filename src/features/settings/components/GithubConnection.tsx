"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Notice } from "@/components/ui/Notice/Notice";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { TextField } from "@/components/ui/TextField/TextField";
import styles from "@/features/team/components/Admin.module.scss";
import { callBackend, messageFor } from "@/lib/backend-client";

interface Status { connected: boolean; repo: string | null; tokenSet: boolean; lastSyncedAt: string | null }

const TEST_REASONS: Record<string, string> = {
  no_token: "No token is stored for this workspace.",
  unauthorized: "GitHub rejected the token (expired or revoked).",
  forbidden: "The token lacks permission for this repository.",
  repo_not_found_or_no_access: "Repository not found, or the token cannot see it.",
  error: "GitHub could not be reached or returned an error.",
};

/** The token is write-only: it is sent once, never displayed again, and the field is cleared after saving. */
export function GithubConnection({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const base = `workspaces/${workspaceId}/integrations/github`;
  const [status, setStatus] = useState<Status | null>(null);
  const [repo, setRepo] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState<"save" | "test" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await callBackend<Status>("GET", base);
      if (cancelled) return;
      if (r.ok) { setStatus(r.data); setRepo(r.data.repo ?? ""); } else setError(messageFor(r.detail));
    })();
    return () => { cancelled = true; };
  }, [base, tick]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy("save"); setError(null); setInfo(null);
    const r = await callBackend<Status>("PUT", base, { repo, token: token || null });
    setBusy(null);
    if (!r.ok) return setError(messageFor(r.detail));
    setToken("");
    setInfo(token ? "Saved. The token is stored encrypted and will not be shown again." : "Repository updated.");
    setTick((t) => t + 1);
  }

  async function test() {
    setBusy("test"); setError(null); setInfo(null);
    const r = await callBackend<{ ok: boolean; reason?: string }>("POST", `${base}/test`, {});
    setBusy(null);
    if (!r.ok) return setError(messageFor(r.detail));
    if (r.data.ok) setInfo("Connection works: GitHub accepted the token for this repository.");
    else setError(TEST_REASONS[r.data.reason ?? "error"] ?? TEST_REASONS.error);
  }

  async function remove() {
    if (!window.confirm("Disconnect GitHub for this workspace and delete the stored token?")) return;
    setBusy("remove"); setError(null); setInfo(null);
    const r = await callBackend("DELETE", base);
    setBusy(null);
    if (!r.ok) return setError(messageFor(r.detail));
    setRepo(""); setInfo("Disconnected. The stored token was deleted.");
    setTick((t) => t + 1);
  }

  return (
    <Card title={`GitHub Actions · ${workspaceName}`} actions={status && <StatusBadge tone={status.connected && status.tokenSet ? "success" : "warning"}>{status.connected ? (status.tokenSet ? "connected" : "no token") : "not connected"}</StatusBadge>}>
      <div className={styles.stack}>
        {error && <Notice variant="error">{error}</Notice>}
        {info && <Notice variant="info">{info}</Notice>}
        <form onSubmit={save} className={styles.stack} noValidate>
          <TextField id="gh-repo" label="Repository (owner/name)" value={repo} onChange={(e) => setRepo(e.target.value)} maxLength={200} autoComplete="off" />
          <TextField id="gh-token" label={status?.tokenSet ? "Replace token (leave blank to keep the current one)" : "Fine-grained access token"}
            type="password" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" maxLength={512} />
          <p className={styles.hint}>
            Use a fine-grained token limited to this one repository: Actions read, plus Actions write only if you want approved re-runs.
            It is encrypted at rest and cannot be viewed again.
          </p>
          <div className={styles.inline}>
            <Button type="submit" loading={busy === "save"} disabled={busy !== null || !repo.trim()}>{status?.connected ? "Save changes" : "Connect"}</Button>
            <Button type="button" variant="ghost" loading={busy === "test"} disabled={busy !== null || !status?.connected} onClick={() => void test()}>Test connection</Button>
            <Button type="button" variant="ghost" disabled={busy !== null || !status?.connected} onClick={() => void remove()}>Disconnect</Button>
          </div>
        </form>
        {status?.lastSyncedAt && <p className={styles.hint}>Last synced {new Date(status.lastSyncedAt).toLocaleString()}</p>}
      </div>
    </Card>
  );
}
