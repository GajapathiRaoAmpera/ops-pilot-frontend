"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/features/auth/components/SessionProvider";
import styles from "./WorkspaceSwitcher.module.scss";

export function WorkspaceSwitcher({ activeId }: { activeId: string | undefined }) {
  const session = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const list = session?.workspaces ?? [];
  if (list.length === 0) return null;

  async function change(id: string) {
    setBusy(true);
    await fetch("/api/workspace", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
    setBusy(false);
  }

  return (
    <label className={styles.label}>
      Workspace
      <select className={styles.select} value={activeId ?? list[0].id} disabled={busy || list.length === 1} onChange={(e) => void change(e.target.value)}>
        {list.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>
    </label>
  );
}
