"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { callBackend, messageFor, referenceFor } from "@/lib/backend-client";
import styles from "./RunControls.module.scss";

export function SyncButton({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);

  async function sync() {
    setBusy(true);
    const r = await callBackend<{ synced: number; repositories?: number; failed?: { repo: string; reason: string }[] }>(
      "POST", `workspaces/${workspaceId}/pipelines/sync`, {});
    setBusy(false);
    if (!r.ok) return notify({ tone: "error", title: "Sync failed", message: messageFor(r.detail), reference: referenceFor(r) });
    const failed = r.data.failed ?? [];
    const total = r.data.repositories ?? 1;
    if (failed.length > 0) {
      notify({ tone: "error", title: `Synced ${total - failed.length} of ${total} repositories`,
        message: `Could not read ${failed.map((f) => f.repo).join(", ")}. Check the token for ${failed.length === 1 ? "it" : "them"} in Settings.`,
        reference: failed.map((f) => `${f.repo}: ${f.reason}`).join("; ") });
    } else {
      notify({ tone: "success", title: "Pipelines synced", message: `${r.data.synced} runs updated from ${total} ${total === 1 ? "repository" : "repositories"}.` });
    }
    router.refresh();
  }

  return <Button variant="ghost" className={styles.small} loading={busy} disabled={busy} onClick={() => void sync()}>Sync now</Button>;
}

/** Creates an approval request. Nothing runs until a different person approves it. */
export function RequestRerun({ workspaceId, runId }: { workspaceId: string; runId: string }) {
  const router = useRouter();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const r = await callBackend("POST", `workspaces/${workspaceId}/action-requests`, { runId, type: "rerun_failed_jobs", reason });
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, text: messageFor(r.detail) }); // inline: tied to this form
    notify({ tone: "success", title: "Request sent for approval", message: "Nothing runs until someone other than you approves it." });
    setSent(true);
    setOpen(false);
    router.refresh();
  }

  if (sent) return <span className={styles.ok}>Awaiting approval</span>;
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
