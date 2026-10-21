"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Notice } from "@/components/ui/Notice/Notice";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { Table } from "@/components/ui/Table/Table";
import { TextField } from "@/components/ui/TextField/TextField";
import { callBackend, inviteUrl, messageFor } from "@/lib/backend-client";
import { ORG_ROLE_KEYS, ROLE_LABELS, WORKSPACE_ROLE_KEYS, WS_ADMIN_GRANTABLE_KEYS, type MemberRow } from "../roles";
import styles from "./Admin.module.scss";

interface Workspace { id: string; name: string }
interface PendingInvite { id: string; email: string; kind: string; expiresAt: string; workspaceId: string | null }

/**
 * Team & Access. The UI only offers roles the user is likely allowed to grant; the backend is the
 * authority and its refusal is shown verbatim as a message. Nothing is shown as done until it confirms.
 */
export function TeamView({ orgAdmin, workspaces }: { orgAdmin: boolean; workspaces: Workspace[] }) {
  const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>(workspaces);
  const [scope, setScope] = useState<string>(orgAdmin ? "" : (workspaces[0]?.id ?? ""));
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [pending, setPending] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<{ label: string; url: string } | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("viewer");
  const [busy, setBusy] = useState(false);

  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (orgAdmin) {
        const [m, w, i] = await Promise.all([
          callBackend<{ members: MemberRow[] }>("GET", "org/members"),
          callBackend<{ workspaces: Workspace[] }>("GET", "org/workspaces"),
          callBackend<{ invitations: PendingInvite[] }>("GET", "org/invitations"),
        ]);
        if (cancelled) return;
        if (!m.ok) setError(messageFor(m.detail));
        else setMembers(m.data.members);
        if (w.ok) setAllWorkspaces(w.data.workspaces);
        if (i.ok) setPending(i.data.invitations);
      } else if (scope) {
        const m = await callBackend<{ members: MemberRow[] }>("GET", `workspaces/${scope}/members`);
        if (cancelled) return;
        if (!m.ok) setError(messageFor(m.detail));
        else setMembers(m.data.members);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [orgAdmin, scope, tick]);

  const roleOptions = orgAdmin ? (scope ? WORKSPACE_ROLE_KEYS : ORG_ROLE_KEYS) : WS_ADMIN_GRANTABLE_KEYS;
  const effectiveRole = (roleOptions as readonly string[]).includes(role) ? role : "viewer";

  async function invite(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const target = orgAdmin ? "org/invitations" : `workspaces/${scope}/invitations`;
    const body = orgAdmin ? { email, role: effectiveRole, workspaceId: scope || null } : { email, role: effectiveRole };
    const r = await callBackend<{ token: string }>("POST", target, body);
    setBusy(false);
    if (!r.ok) return setError(messageFor(r.detail));
    setLink({ label: `Invitation for ${email.trim().toLowerCase()}`, url: inviteUrl(r.data.token) });
    setEmail("");
    reload();
  }

  async function act(label: string, fn: () => ReturnType<typeof callBackend>, show?: (d: { token: string }) => void) {
    if (!window.confirm(label)) return;
    setError(null);
    const r = await fn();
    if (!r.ok) return setError(messageFor(r.detail));
    if (show) show(r.data as { token: string });
    reload();
  }

  const memberPath = (m: MemberRow) => (orgAdmin ? `org/memberships/${m.membershipId}` : `workspaces/${scope}/memberships/${m.membershipId}`);

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="Governance // Team & Access"
        title="Team & Access"
        description={orgAdmin
          ? "Invite people to your organization or a single workspace, and manage their roles. People set their own password from the invitation link."
          : "Invite people to your workspace and manage the roles you are allowed to grant."}
      />
      {error && <Notice variant="error">{error}</Notice>}

      <Card title="Invite someone" flush>
        <form className={styles.form} onSubmit={invite}>
          <TextField id="invite-email" label="Work email" type="email" value={email} required maxLength={320}
            onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          <label className={styles.selectField}>
            Role
            <select className={styles.select} value={effectiveRole} onChange={(e) => setRole(e.target.value)}>
              {roleOptions.map((k) => <option key={k} value={k}>{ROLE_LABELS[k]}</option>)}
            </select>
          </label>
          <label className={styles.selectField}>
            {orgAdmin ? "Access scope" : "Workspace"}
            <select className={styles.select} value={scope} onChange={(e) => setScope(e.target.value)}>
              {orgAdmin && <option value="">Whole organization</option>}
              {allWorkspaces.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </label>
          <Button type="submit" loading={busy} disabled={busy || (!orgAdmin && !scope)}>Create invitation</Button>
        </form>
      </Card>

      {link && (
        <div className={styles.linkBox} role="status">
          <strong>{link.label}</strong>
          <span className={styles.linkText}>{link.url}</span>
          <span className={styles.hint}>Shown once. Send it to them through a secure channel; it expires in 7 days and works once.</span>
          <div className={styles.inline}>
            <Button className={styles.small} onClick={() => void navigator.clipboard.writeText(link.url)}>Copy link</Button>
            <Button variant="ghost" className={styles.small} onClick={() => setLink(null)}>Dismiss</Button>
          </div>
        </div>
      )}

      <Card title={`Members${loading ? " (loading…)" : ` (${members.length})`}`} flush>
        {members.length === 0 && !loading ? (
          <p className={styles.pad}>No members to show.</p>
        ) : (
          <Table caption="Members and roles">
            <thead><tr><th scope="col">Person</th><th scope="col">Role</th><th scope="col">Scope</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.membershipId}>
                  <td>{m.name}<br /><span className={styles.hint}>{m.email}</span></td>
                  <td>{m.roleLabel}</td>
                  <td>{m.workspace ?? "Whole organization"}</td>
                  <td><StatusBadge tone={m.disabled ? "error" : "success"}>{m.disabled ? "disabled" : "active"}</StatusBadge></td>
                  <td>
                    <div className={styles.rowActions}>
                      <select aria-label={`Change role for ${m.email}`} className={styles.select} value={m.role}
                        onChange={(e) => void act(`Change ${m.email} to ${ROLE_LABELS[e.target.value]}?`, () => callBackend("PATCH", memberPath(m), { role: e.target.value }))}>
                        {(m.workspaceId ? WORKSPACE_ROLE_KEYS : ORG_ROLE_KEYS).map((k) => <option key={k} value={k}>{ROLE_LABELS[k]}</option>)}
                      </select>
                      <Button variant="ghost" className={styles.small}
                        onClick={() => void act(`Remove ${m.email} from this ${m.workspaceId ? "workspace" : "organization"}?`, () => callBackend("DELETE", memberPath(m)))}>Remove</Button>
                      {orgAdmin && (
                        <>
                          <Button variant="ghost" className={styles.small}
                            onClick={() => void act(`Create a password-reset link for ${m.email}?`, () => callBackend("POST", `org/members/${m.userId}/reset-link`, {}),
                              (d) => setLink({ label: `Password reset for ${m.email} (valid 2 hours)`, url: inviteUrl(d.token) }))}>Reset password</Button>
                          <Button variant="ghost" className={styles.small}
                            onClick={() => void act(`Disable ${m.email} everywhere and sign them out?`, () => callBackend("DELETE", `org/members/${m.userId}`))}>Disable</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {orgAdmin && pending.length > 0 && (
        <Card title={`Pending invitations (${pending.length})`} flush>
          <Table caption="Pending invitations">
            <thead><tr><th scope="col">Email</th><th scope="col">Expires</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {pending.map((p) => (
                <tr key={p.id}>
                  <td>{p.email}</td>
                  <td>{new Date(p.expiresAt).toLocaleString()}</td>
                  <td><Button variant="ghost" className={styles.small}
                    onClick={() => void act(`Revoke the invitation for ${p.email}?`, () => callBackend("DELETE", `org/invitations/${p.id}`))}>Revoke</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
