"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { useSession } from "@/features/auth/components/SessionProvider";
import { destinationAfterSwitch } from "./after-switch";
import styles from "./WorkspaceSwitcher.module.scss";

/** Shows the active organization; a chooser appears only for people who belong to more than one. */
export function OrganizationSwitcher() {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  if (!session) return null;
  const orgs = session.organizations;

  if (orgs.length <= 1) {
    return (
      <div className={styles.orgBox}>
        <p className={styles.orgLabel}>Organization</p>
        <p className={styles.orgName} title={session.organization.name}>{session.organization.name}</p>
      </div>
    );
  }

  async function change(id: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/organization", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error("switch_failed");
      const body = (await res.json()) as { permissions?: string[] };
      const name = orgs.find((o) => o.id === id)?.name ?? "the organization";
      notify({ tone: "info", title: `Switched to ${name}` });
      const to = destinationAfterSwitch(pathname, body.permissions);
      if (to) router.push(to); else router.refresh();
    } catch {
      notify({ tone: "error", title: "Could not switch organization", message: "Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className={`${styles.label} ${styles.orgBox}`}>
      <span className={styles.caption}>Organization{busy && <span className={styles.spin} aria-hidden="true" />}</span>
      <select className={styles.select} value={session.organization.id} aria-busy={busy} disabled={busy} onChange={(e) => void change(e.target.value)}>
        {orgs.map((o) => <option key={o.id} value={o.id}>{o.name} · {o.role}</option>)}
      </select>
    </label>
  );
}
