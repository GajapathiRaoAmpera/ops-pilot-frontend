"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/features/auth/components/SessionProvider";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import styles from "./WorkspaceSwitcher.module.scss";

export function WorkspaceSwitcher({ activeId }: { activeId: string | undefined }) {
  const session = useSession();
  const router = useRouter();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);
  const list = session?.workspaces ?? [];
  if (list.length === 0) return null;

  async function change(id: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/workspace", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error("switch_failed");
      router.refresh();
    } catch {
      notify({ tone: "error", title: "Could not switch workspace", message: "Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className={styles.label}>
      <span className={styles.caption}>Workspace{busy && <span className={styles.spin} aria-hidden="true" />}</span>
      <select aria-busy={busy} className={styles.select} value={activeId ?? list[0].id} disabled={busy || list.length === 1} onChange={(e) => void change(e.target.value)}>
        {list.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>
    </label>
  );
}
