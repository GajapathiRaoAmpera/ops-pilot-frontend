"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Notice } from "@/components/ui/Notice/Notice";
import { TextField } from "@/components/ui/TextField/TextField";
import { callBackend } from "@/lib/backend-client";
import styles from "../SignIn/SignIn.module.scss";

const MIN = 12;

export function ChangePassword({ forced }: { forced: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (next.length < MIN) return setError(`Use at least ${MIN} characters.`);
    if (next !== confirm) return setError("The new passwords do not match.");
    if (next === current) return setError("Choose a password different from the current one.");
    setBusy(true);
    const r = await callBackend("POST", "auth/change-password", { currentPassword: current, newPassword: next });
    setBusy(false);
    if (!r.ok) {
      return setError(r.detail === "invalid_credentials" ? "The current password is incorrect." : "The password could not be changed. Please try again.");
    }
    router.replace("/login"); // an authenticated visitor is sent on to their landing page
    router.refresh();
  }

  return (
    <section aria-labelledby="cp-heading" className={styles.panel}>
      <h1 id="cp-heading" className={styles.title}>{forced ? "Set your own password" : "Change password"}</h1>
      <p className={styles.formLead}>
        {forced ? "Your account uses a temporary password. Choose a new one to continue." : "Other devices will be signed out."}
      </p>
      {error && <Notice variant="error">{error}</Notice>}
      <form onSubmit={submit} noValidate>
        <TextField id="cp-current" label={forced ? "Temporary password" : "Current password"} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        <TextField id="cp-new" label="New password" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
        <TextField id="cp-confirm" label="Confirm new password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        <p className={styles.formLead}>At least {MIN} characters.</p>
        <Button type="submit" fullWidth loading={busy} disabled={busy}>Update password</Button>
      </form>
    </section>
  );
}
