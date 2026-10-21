"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { Table } from "@/components/ui/Table/Table";
import { cx } from "@/lib/cx";
import { MOCK_MATRIX, MOCK_MATRIX_META } from "../../mock-data";
import type { Cell } from "../../types";
import styles from "./PermissionMatrix.module.scss";

const COLUMNS = ["read", "create", "update", "delete", "execute", "approve"] as const;

function MatrixCell({ cell, label }: { cell: Cell; label: string }) {
  if (cell === "yes") return <span className={cx(styles.mark, styles.yes)}><Icon name="check" size={16} /><span className={styles.sr}>{label}: allowed</span></span>;
  if (cell === "no") return <span className={cx(styles.mark, styles.no)}><Icon name="block" size={16} /><span className={styles.sr}>{label}: denied</span></span>;
  if (cell === "na") return <span><span aria-hidden="true">-</span><span className={styles.sr}>{label}: not applicable</span></span>;
  return (
    <StatusBadge tone="info" icon={cell.icon}>{cell.label}</StatusBadge>
  );
}

export function PermissionMatrix() {
  const [destructiveOnly, setDestructiveOnly] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const rows = destructiveOnly ? MOCK_MATRIX.filter((r) => r.destructive) : MOCK_MATRIX;

  return (
    <Card
      title="Resource Permission Matrix"
      flush
      actions={
        <div className={styles.controls}>
          <StatusBadge tone="neutral">{`${MOCK_MATRIX_META.domainsActive} Resource Domains Active`}</StatusBadge>
          <Button variant="ghost" aria-pressed={destructiveOnly} onClick={() => setDestructiveOnly((v) => !v)}>
            <Icon name="filter_alt" size={16} />Filter: Destructive Only
          </Button>
          <Button variant="ghost" aria-pressed={expanded} onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Collapse All Conditions" : "Expand All Conditions"}
          </Button>
        </div>
      }
    >
      <Table caption="Resource permission matrix for the selected role (mock data)">
        <thead>
          <tr>
            <th scope="col">Resource / Domain</th>
            {COLUMNS.map((c) => <th key={c} scope="col">{c}</th>)}
            <th scope="col">Enforced scope &amp; conditions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={row.elevated ? styles.elevated : undefined}>
              <th scope="row" className={styles.resource}>
                <Icon name={row.icon} size={18} />
                <span><strong>{row.name}</strong><code className={styles.code}>{row.id}</code></span>
              </th>
              {COLUMNS.map((c) => <td key={c}><MatrixCell cell={row[c]} label={`${row.name} ${c}`} /></td>)}
              <td>
                <span className={styles.scope}>{row.scope}</span>
                {expanded && <span className={styles.condition}>{row.conditions}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p className={styles.foot} role="status">
        <span>Displaying {rows.length} of {MOCK_MATRIX_META.domainsTotal} domain specifications (mock)</span>
        <span>Inherited via template: <code>{MOCK_MATRIX_META.template}</code></span>
        <span><Icon name="shield" size={14} /> Policy checksum: <code>{MOCK_MATRIX_META.checksum}</code> (static mock value)</span>
      </p>
    </Card>
  );
}
