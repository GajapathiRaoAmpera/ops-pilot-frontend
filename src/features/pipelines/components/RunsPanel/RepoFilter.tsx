"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import styles from "./RunControls.module.scss";

/** Filters runs by repository through the URL, so the choice survives reloads and can be shared as a link. */
export function RepoFilter({ repositories, value }: { repositories: string[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  function choose(repo: string) {
    const next = new URLSearchParams(params.toString());
    if (repo) next.set("repo", repo); else next.delete("repo");
    const q = next.toString();
    start(() => router.push(q ? `${pathname}?${q}` : pathname));
  }

  return (
    <label className={styles.filter}>
      <span>Repository</span>
      <select value={value} aria-busy={pending} disabled={pending} onChange={(e) => choose(e.target.value)}>
        <option value="">All repositories ({repositories.length})</option>
        {repositories.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
    </label>
  );
}
