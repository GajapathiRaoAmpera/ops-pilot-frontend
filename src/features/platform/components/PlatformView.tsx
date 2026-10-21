"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Notice } from "@/components/ui/Notice/Notice";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { Table } from "@/components/ui/Table/Table";
import { TextField } from "@/components/ui/TextField/TextField";
import styles from "@/features/team/components/Admin.module.scss";
import { callBackend, inviteUrl, messageFor } from "@/lib/backend-client";

interface Org { id: string; name: string; workspaces: number; members: number }

/** Platform operators create tenants. They see counts only, never tenant operational data. */
export function PlatformView() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<{ label: string; url: string } | null>(null);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await callBackend<{ organizations: Org[] }>("GET", "platform/organizations");
      if (cancelled) return;
      if (r.ok) setOrgs(r.data.organizations);
      else setError(messageFor(r.detail));
    })();
    return () => { cancelled = true; };
  }, [tick]);

  async function create(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const r = await callBackend<{ name: string; adminInvitation: { email: string; token: string } }>(
      "POST", "platform/organizations", { name, adminEmail });
    setBusy(false);
    if (!r.ok) return setError(messageFor(r.detail));
    setLink({ label: `First administrator invitation for ${r.data.name} (${r.data.adminInvitation.email})`, url: inviteUrl(r.data.adminInvitation.token) });
    setName("");
    setAdminEmail("");
    setTick((t) => t + 1);
  }

  return (
    <div className={styles.stack}>
      <PageHeader eyebrow="Platform // Tenants" title="Organizations"
        description="Create an organization and invite its first administrator. They set their own password and then invite their own team." />
      {error && <Notice variant="error">{error}</Notice>}
      <Card title="Create organization" flush>
        <form className={styles.form} onSubmit={create}>
          <TextField id="org-name" label="Organization name" value={name} required minLength={2} maxLength={200} onChange={(e) => setName(e.target.value)} />
          <TextField id="org-admin" label="First administrator email" type="email" value={adminEmail} required maxLength={320} onChange={(e) => setAdminEmail(e.target.value)} />
          <span />
          <Button type="submit" loading={busy} disabled={busy}>Create &amp; invite</Button>
        </form>
      </Card>
      {link && (
        <div className={styles.linkBox} role="status">
          <strong>{link.label}</strong>
          <span className={styles.linkText}>{link.url}</span>
          <span className={styles.hint}>Shown once. Send it securely; it expires in 7 days and works once.</span>
          <div className={styles.inline}>
            <Button className={styles.small} onClick={() => void navigator.clipboard.writeText(link.url)}>Copy link</Button>
            <Button variant="ghost" className={styles.small} onClick={() => setLink(null)}>Dismiss</Button>
          </div>
        </div>
      )}
      <Card title={`Organizations (${orgs.length})`} flush>
        <Table caption="Organizations">
          <thead><tr><th scope="col">Name</th><th scope="col">Workspaces</th><th scope="col">Members</th></tr></thead>
          <tbody>{orgs.map((o) => <tr key={o.id}><td>{o.name}</td><td>{o.workspaces}</td><td>{o.members}</td></tr>)}</tbody>
        </Table>
      </Card>
    </div>
  );
}
