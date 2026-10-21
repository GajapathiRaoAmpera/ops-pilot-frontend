"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { callBackend, messageFor } from "@/lib/backend-client";
import styles from "./RunControls.module.scss";

export function SyncButton({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function sync() {
    setBusy(true);
    setMsg(null);
    const r = await callBackend<{ synced: number }>("POST", `workspaces/${workspaceId}/pipelines/sync`, {});
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, text: messageFor(r.detail) });
    setMsg({ ok: true, text: `Synced ${r.data.synced} runs.` });
    router.refresh();
  }

  return (
    <span className={styles.inline}>
      <Button variant="ghost" className={styles.small} loading={busy} disabled={busy} onClick={() => void sync()}>Sync now</Button>
      {msg && <span role={msg.ok ? "status" : "alert"} className={msg.ok ? styles.ok : styles.err}>{msg.text}</span>}
    </span>
  );
}

/** Creates an approval request. Nothing runs until a different person approves it. */
export function RequestRerun({ workspaceId, runId }: { workspaceId: string; runId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const r = await callBackend("POST", `workspaces/${workspaceId}/action-requests`, { runId, type: "rerun_failed_jobs", reason });
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, text: messageFor(r.detail) });
    setMsg({ ok: true, text: "Request sent. Waiting for approval; nothing has run yet." });
    setOpen(false);
    router.refresh();
  }

  if (msg?.ok) return <span role="status" className={styles.ok}>{msg.text}</span>;
  if (!open) {
    return (
      <>
        <Button variant="ghost" className={styles.small} onClick={() => setOpen(true)}>Request re-run</Button>
        {msg && <span role="alert" className={styles.err}>{msg.text}</span>}
      </>
    );
  }
  return (
    <form onSubmit={submit} className={styles.inline}>
      <input aria-label="Reason for re-run" className={styles.input} value={reason} maxLength={1000} placeholder="Why re-run?" onChange={(e) => setReason(e.target.value)} />
      <Button type="submit" className={styles.small} loading={busy} disabled={busy}>Send for approval</Button>
      <Button type="button" variant="ghost" className={styles.small} onClick={() => setOpen(false)}>Cancel</Button>
      {msg && <span role="alert" className={styles.err}>{msg.text}</span>}
    </form>
  );
}
