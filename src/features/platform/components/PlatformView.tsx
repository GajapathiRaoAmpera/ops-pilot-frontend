"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { LoaderRows } from "@/components/ui/Loader/Loader";
import { Notice } from "@/components/ui/Notice/Notice";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatusBadge, type Tone } from "@/components/ui/StatusBadge/StatusBadge";
import { Table } from "@/components/ui/Table/Table";
import { TextField } from "@/components/ui/TextField/TextField";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import styles from "@/features/team/components/Admin.module.scss";
import type { MemberRow } from "@/features/team/roles";
import { callBackend, inviteUrl, messageFor, referenceFor } from "@/lib/backend-client";

type OrgStatus = "active" | "suspended" | "archived";
interface Org { id: string; name: string; status?: string; workspaces: number; members: number }
interface RoleCatalog { roles: { key: string; label: string }[]; workspaceRoles: string[] }

const STATUS: Record<OrgStatus, { tone: Tone; label: string }> = {
  active: { tone: "success", label: "active" },
  suspended: { tone: "error", label: "blocked" },
  archived: { tone: "neutral", label: "deleted (archived)" },
};

/** An older backend sends no status (it has no blocking, so the organization is active); anything unknown is shown
 * as-is rather than guessed. */
function statusOf(o: { status?: string }): { key: OrgStatus | null; tone: Tone; label: string } {
  if (o.status === undefined) return { key: "active", ...STATUS.active };
  return o.status in STATUS ? { key: o.status as OrgStatus, ...STATUS[o.status as OrgStatus] } : { key: null, tone: "neutral", label: o.status };
}

/** Platform operators: organizations and the people in them. Never a tenant's runs, approvals or logs. */
export function PlatformView() {
  const { notify } = useToast();
  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<{ label: string; url: string } | null>(null);
  const [managing, setManaging] = useState<Org | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

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
    reload();
  }

  /** Confirms, calls the backend, reports the real result as a toast, refreshes. */
  async function act(question: string | null, run: () => ReturnType<typeof callBackend>, done: string) {
    if (question && !window.confirm(question)) return;
    const r = await run();
    if (!r.ok) return notify({ tone: "error", title: "That did not work", message: messageFor(r.detail), reference: referenceFor(r) });
    notify({ tone: "success", title: done });
    reload();
  }

  function rename(o: Org) {
    const next = window.prompt(`New name for ${o.name}`, o.name)?.trim();
    if (!next || next === o.name) return;
    void act(null, () => callBackend("PATCH", `platform/organizations/${o.id}`, { name: next }), `Renamed to ${next}`);
  }
  function remove(o: Org) {
    const typed = window.prompt(`Delete ${o.name}? Everyone loses access. The data is kept (archived) so it can be restored.\n\nType the organization's name to confirm:`);
    if (typed === null) return;
    void act(null, () => callBackend("DELETE", `platform/organizations/${o.id}`, { confirm: typed }), `${o.name} deleted (archived)`);
  }

  return (
    <div className={styles.stack}>
      <PageHeader eyebrow="Platform" title="Organizations"
        description="Create organizations, block or delete them, and manage the people in them. You never see an organization's pipelines, approvals or logs." />
      {error && <Notice variant="error">{error}</Notice>}
      <Card title="Create organization" info="Creates a new organization and an invitation link for its first administrator. Share the link with them." flush>
        <form className={styles.form} onSubmit={create}>
          <TextField id="org-name" label="Organization name" value={name} required minLength={2} maxLength={200} onChange={(e) => setName(e.target.value)} />
          <TextField id="org-admin" label="First administrator email" type="email" value={adminEmail} required maxLength={320} onChange={(e) => setAdminEmail(e.target.value)} />
          <span />
          <Button type="submit" loading={busy} disabled={busy}>Create &amp; invite</Button>
        </form>
      </Card>
      {link && <LinkBox link={link} onDone={() => setLink(null)} />}
      <Card title={`Organizations${orgs ? ` (${orgs.length})` : ""}`} info="Every organization on the platform. Block one to cut off access; delete keeps its data but hides it." flush>
        {orgs === null ? <LoaderRows /> : orgs.length === 0 ? (
          <EmptyState icon="domain" title="No organizations yet">Create the first one above.</EmptyState>
        ) : (
          <Table caption="Organizations">
            <thead><tr><th scope="col">Name</th><th scope="col">Status</th><th scope="col">Workspaces</th><th scope="col">Members</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id}>
                  <td>{o.name}</td>
                  <td><StatusBadge tone={statusOf(o).tone}>{statusOf(o).label}</StatusBadge></td>
                  <td>{o.workspaces}</td>
                  <td>{o.members}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button variant="ghost" className={styles.small} aria-pressed={managing?.id === o.id}
                        onClick={() => setManaging(managing?.id === o.id ? null : o)}>{managing?.id === o.id ? "Close people" : "Manage people"}</Button>
                      <Button variant="ghost" className={styles.small} onClick={() => rename(o)}>Rename</Button>
                      {statusOf(o).key === "active" && (
                        <Button variant="ghost" className={styles.small}
                          onClick={() => void act(`Block ${o.name}? Everyone in it loses access straight away, until you reactivate it.`,
                            () => callBackend("PATCH", `platform/organizations/${o.id}`, { status: "suspended" }), `${o.name} blocked`)}>Block</Button>
                      )}
                      {statusOf(o).key !== "active" && (
                        <Button variant="ghost" className={styles.small}
                          onClick={() => void act(`Reactivate ${o.name}? Its members get their access back.`,
                            () => callBackend("PATCH", `platform/organizations/${o.id}`, { status: "active" }), `${o.name} reactivated`)}>
                          {statusOf(o).key === "archived" ? "Restore" : "Reactivate"}
                        </Button>
                      )}
                      {statusOf(o).key === "suspended" && <Button variant="ghost" className={styles.small} onClick={() => remove(o)}>Delete</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      {managing && <OrgPeople key={managing.id} org={managing} onLink={setLink} onChanged={reload} />}
    </div>
  );
}

function LinkBox({ link, onDone }: { link: { label: string; url: string }; onDone: () => void }) {
  const { notify } = useToast();
  return (
    <div className={styles.linkBox} role="status">
      <strong>{link.label}</strong>
      <span className={styles.linkText}>{link.url}</span>
      <span className={styles.hint}>Shown once. Send it securely; it works once and expires.</span>
      <div className={styles.inline}>
        <Button className={styles.small} onClick={() => { void navigator.clipboard.writeText(link.url); notify({ tone: "success", title: "Link copied" }); }}>Copy link</Button>
        <Button variant="ghost" className={styles.small} onClick={onDone}>Dismiss</Button>
      </div>
    </div>
  );
}

/** The people in one organization, managed by the platform administrator with the same rules its admins follow. */
function OrgPeople({ org, onLink, onChanged }: { org: Org; onLink: (l: { label: string; url: string }) => void; onChanged: () => void }) {
  const { notify } = useToast();
  const base = `platform/organizations/${org.id}`;
  const [members, setMembers] = useState<MemberRow[] | null>(null);
  const [workspaces, setWorkspaces] = useState<{ id: string; name: string }[]>([]);
  const [catalog, setCatalog] = useState<RoleCatalog | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [scope, setScope] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [m, w, c] = await Promise.all([
        callBackend<{ members: MemberRow[] }>("GET", `${base}/members`),
        callBackend<{ workspaces: { id: string; name: string }[] }>("GET", `${base}/workspaces`),
        callBackend<RoleCatalog>("GET", "meta/roles"),
      ]);
      if (cancelled) return;
      setMembers(m.ok ? m.data.members : []);
      if (w.ok) setWorkspaces(w.data.workspaces);
      if (c.ok) setCatalog(c.data);
    })();
    return () => { cancelled = true; };
  }, [base, tick]);

  const labels = Object.fromEntries((catalog?.roles ?? []).map((r) => [r.key, r.label]));
  const roleOptions = scope ? (catalog?.workspaceRoles ?? []) : (catalog?.roles ?? []).map((r) => r.key);
  const effectiveRole = roleOptions.includes(role) ? role : roleOptions[0] ?? "";

  async function act(question: string, run: () => ReturnType<typeof callBackend>, done: string, after?: (d: { token: string }) => void) {
    if (!window.confirm(question)) return;
    const r = await run();
    if (!r.ok) return notify({ tone: "error", title: "That did not work", message: messageFor(r.detail), reference: referenceFor(r) });
    notify({ tone: "success", title: done });
    after?.(r.data as { token: string });
    setTick((t) => t + 1);
    onChanged();
  }

  async function invite(e: FormEvent) {
    e.preventDefault();
    if (busy || !effectiveRole) return;
    setBusy(true); setFormError(null);
    const r = await callBackend<{ email: string; token: string }>("POST", `${base}/invitations`, { email, role: effectiveRole, workspaceId: scope || null });
    setBusy(false);
    if (!r.ok) return setFormError(messageFor(r.detail));
    onLink({ label: `Invitation for ${r.data.email} to ${org.name} (${labels[effectiveRole] ?? effectiveRole})`, url: inviteUrl(r.data.token) });
    setEmail("");
    setTick((t) => t + 1);
    onChanged();
  }

  return (
    <Card title={`People in ${org.name}`} info="Invite people into this organization, change their role, block them, or send a password reset link." flush>
      {statusOf(org).key !== "active" && <div className={styles.pad}><Notice variant="info">This organization is {statusOf(org).label}: nobody in it has access, and new invitations are paused.</Notice></div>}
      <form className={styles.form} onSubmit={invite} noValidate>
        <TextField id="pa-invite-email" label="Invite by email" type="email" value={email} maxLength={320} onChange={(e) => setEmail(e.target.value)} />
        <label className={styles.selectField}>Role
          <select className={styles.select} value={effectiveRole} onChange={(e) => setRole(e.target.value)}>
            {roleOptions.map((k) => <option key={k} value={k}>{labels[k] ?? k}</option>)}
          </select>
        </label>
        <label className={styles.selectField}>Access scope
          <select className={styles.select} value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="">Whole organization</option>
            {workspaces.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </label>
        <Button type="submit" loading={busy} disabled={busy || !email.trim() || statusOf(org).key !== "active"}>Create invitation</Button>
      </form>
      {formError && <div className={styles.pad}><Notice variant="error">{formError}</Notice></div>}
      {members === null ? <LoaderRows /> : members.length === 0 ? (
        <EmptyState icon="group" title="Nobody here yet">Invite the first person above.</EmptyState>
      ) : (
        <Table caption={`People in ${org.name}`}>
          <thead><tr><th scope="col">Person</th><th scope="col">Role</th><th scope="col">Scope</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.membershipId}>
                <td>{m.name}<br /><span className={styles.hint}>{m.email}</span></td>
                <td>
                  <select aria-label={`Change role for ${m.email}`} className={styles.select} value={m.role}
                    onChange={(e) => void act(`Change ${m.email} to ${labels[e.target.value] ?? e.target.value}?`,
                      () => callBackend("PATCH", `${base}/memberships/${m.membershipId}`, { role: e.target.value }), "Role changed")}>
                    {(m.workspaceId ? (catalog?.workspaceRoles ?? []) : (catalog?.roles ?? []).map((r) => r.key)).map((k) => <option key={k} value={k}>{labels[k] ?? k}</option>)}
                  </select>
                </td>
                <td>{m.workspace ?? "Whole organization"}</td>
                <td><StatusBadge tone={m.disabled || m.blocked ? "error" : "success"}>{m.disabled ? "account blocked" : m.blocked ? "blocked here" : "active"}</StatusBadge></td>
                <td>
                  <div className={styles.rowActions}>
                    <Button variant="ghost" className={styles.small}
                      onClick={() => void act(`${m.blocked ? "Unblock" : "Block"} ${m.email} in ${org.name}?`,
                        () => callBackend("POST", `${base}/members/${m.userId}/block`, { blocked: !m.blocked }), m.blocked ? "Unblocked" : "Blocked in this organization")}>
                      {m.blocked ? "Unblock here" : "Block here"}
                    </Button>
                    <Button variant="ghost" className={styles.small}
                      onClick={() => void act(`Create a password-reset link for ${m.email}?`, () => callBackend("POST", `${base}/members/${m.userId}/reset-link`, {}),
                        "Reset link created", (d) => onLink({ label: `Password reset for ${m.email} (valid 2 hours)`, url: inviteUrl(d.token) }))}>Reset password</Button>
                    <Button variant="ghost" className={styles.small}
                      onClick={() => void act(`${m.disabled ? "Unblock" : "Block"} ${m.email}'s whole account? ${m.disabled ? "" : "They are signed out of every organization."}`,
                        () => callBackend("POST", `platform/users/${m.userId}/block`, { blocked: !m.disabled }), m.disabled ? "Account unblocked" : "Account blocked")}>
                      {m.disabled ? "Unblock account" : "Block account"}
                    </Button>
                    <Button variant="ghost" className={styles.small}
                      onClick={() => void act(`Remove ${m.email} from ${m.workspace ?? org.name}?`, () => callBackend("DELETE", `${base}/memberships/${m.membershipId}`), "Removed")}>Remove</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
