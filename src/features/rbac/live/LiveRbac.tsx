"use client";
import { LoaderRows } from "@/components/ui/Loader/Loader";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { Notice } from "@/components/ui/Notice/Notice";
import { Table } from "@/components/ui/Table/Table";
import styles from "@/features/team/components/Admin.module.scss";
import { callBackend, messageFor } from "@/lib/backend-client";

interface Matrix { roles: { key: string; label: string; permissions: string[] }[] }

/** Read-only: exactly what the backend enforces, one column per role. */
export function LiveRbac() {
  const [data, setData] = useState<Matrix | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await callBackend<Matrix>("GET", "rbac/matrix");
      if (cancelled) return;
      if (r.ok) setData(r.data); else setError(messageFor(r.detail));
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) return <Notice variant="error">{error}</Notice>;
  if (!data) return <LoaderRows />;
  const perms = [...new Set(data.roles.flatMap((r) => r.permissions))].sort();
  return (
    <Card title="Role permission matrix" info="Each column is a role and each row a permission. A check mark means the role has it. Change who has which role under Team & access." flush>
      <Table caption="Permissions granted to each role">
        <thead>
          <tr><th scope="col">Permission</th>{data.roles.map((r) => <th key={r.key} scope="col">{r.label}</th>)}</tr>
        </thead>
        <tbody>
          {perms.map((p) => (
            <tr key={p}>
              <th scope="row">{p}</th>
              {data.roles.map((r) => {
                const yes = r.permissions.includes(p);
                return <td key={r.key}><Icon name={yes ? "check" : "block"} size={16} /><span className={styles.sr}>{yes ? "allowed" : "denied"}</span></td>;
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
