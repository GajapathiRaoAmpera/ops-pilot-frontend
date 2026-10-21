"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Notice } from "@/components/ui/Notice/Notice";
import { TextField } from "@/components/ui/TextField/TextField";
import styles from "@/features/auth/components/SignIn/SignIn.module.scss";
import { callBackend, messageFor } from "@/lib/backend-client";

export interface InvitePreview {
  kind: "invite" | "reset";
  email: string;
  organization: string;
  workspace: string | null;
  role: string | null;
  accountExists: boolean;
}

const MIN = 12;

export function AcceptInvite({ token, preview, signedInEmail }: {
  token: string;
  preview: InvitePreview | null;
  signedInEmail: string | null;
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"created" | "reset" | "joined" | null>(null);

  if (!preview) {
    return (
      <section className={styles.panel}>
        <h1 className={styles.title}>Link not valid</h1>
        <p className={styles.summary}>{messageFor("invalid_or_expired")} Ask your administrator for a new one.</p>
        <p className={styles.formLead}><Link href="/login">Go to sign in</Link></p>
      </section>
    );
  }

  const isReset = preview.kind === "reset";
  const joinExisting = !isReset && preview.accountExists;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!joinExisting) {
      if (password.length < MIN) return setError(`Use at least ${MIN} characters.`);
      if (password !== confirm) return setError("The passwords do not match.");
      if (!isReset && !name.trim()) return setError("Enter your name.");
    }
    setBusy(true);
    const r = joinExisting
      ? await callBackend("POST", "invitations/accept-existing", { token })
      : await callBackend("POST", "invitations/accept", { token, name, password });
    setBusy(false);
    if (!r.ok) return setError(messageFor(r.detail));
    setDone(joinExisting ? "joined" : isReset ? "reset" : "created");
  }

  if (done) {
    return (
      <section className={styles.panel} role="status">
        <h1 className={styles.title}>{done === "reset" ? "Password updated" : done === "joined" ? "You have joined" : "Account ready"}</h1>
        <p className={styles.summary}>
          {done === "joined" ? `You now have access to ${preview.organization}.` : "You can now sign in."}
        </p>
        <p className={styles.formLead}><Link href={done === "joined" ? "/overview" : "/login"}>Continue</Link></p>
      </section>
    );
  }

  const heading = isReset ? "Choose a new password" : `Join ${preview.organization}`;
  return (
    <section aria-labelledby="inv-heading" className={styles.panel}>
      <h1 id="inv-heading" className={styles.title}>{heading}</h1>
      {!isReset && (
        <p className={styles.summary}>
          You were invited as <strong>{preview.role}</strong>{preview.workspace ? <> in workspace <strong>{preview.workspace}</strong></> : null}.
        </p>
      )}
      <p className={styles.formLead}>Account: {preview.email}</p>
      {error && <Notice variant="error">{error}</Notice>}
      {joinExisting && signedInEmail?.toLowerCase() !== preview.email.toLowerCase() ? (
        <p className={styles.summary}>
          This email already has an account. <Link href={`/login?next=${encodeURIComponent(`/accept-invite?token=${token}`)}`}>Sign in</Link> as {preview.email} to accept.
        </p>
      ) : (
        <form onSubmit={submit} noValidate>
          {!joinExisting && !isReset && (
            <TextField id="inv-name" label="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={200} />
          )}
          {!joinExisting && (
            <>
              <TextField id="inv-pw" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              <TextField id="inv-pw2" label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
              <p className={styles.formLead}>At least {MIN} characters. Use a passphrase you do not use elsewhere.</p>
            </>
          )}
          <Button type="submit" fullWidth loading={busy} disabled={busy}>
            {joinExisting ? "Accept invitation" : isReset ? "Set new password" : "Create my account"}
          </Button>
        </form>
      )}
    </section>
  );
}
