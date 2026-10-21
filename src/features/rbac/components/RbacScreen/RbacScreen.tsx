"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Icon } from "@/components/ui/Icon/Icon";
import { PageHeader } from "@/components/ui/PageHeader/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { cx } from "@/lib/cx";
import { MOCK_COMPLIANCE, MOCK_DEVOPS_ROLE, MOCK_ROLES, MOCK_SCOPE, MOCK_SOD_RULES } from "../../mock-data";
import { PermissionMatrix } from "../PermissionMatrix/PermissionMatrix";
import styles from "./RbacScreen.module.scss";

export function RbacScreen() {
  const [selected, setSelected] = useState("DevOps Engineer");
  const hasMock = selected === MOCK_DEVOPS_ROLE.name;

  return (
    <>
      <PageHeader
        eyebrow="Enterprise RBAC"
        title="Role-Based Access Control (RBAC) & Governance"
        description="Configure granular tenant-level roles, resource-level permissions, and dual-authorization policies across organizations and isolated workspaces."
        actions={
          <div className={styles.headerActions}>
            <Button variant="ghost" disabled><Icon name="download" size={16} />Audit Log Export (not connected)</Button>
            <Button variant="ghost" disabled><Icon name="play_circle" size={16} />Simulate Policy (not connected)</Button>
            <Button disabled><Icon name="add" size={16} />Create Custom Role (not connected)</Button>
          </div>
        }
      />

      <div className={styles.scopeBar} aria-label="Scope (mock values)">
        <span><span className={styles.label}>Tenant scope:</span> <Icon name="domain" size={16} /> {MOCK_SCOPE.tenant}</span>
        <span><span className={styles.label}>Workspace target:</span> <code>{MOCK_SCOPE.workspace}</code> (Locked Environment)</span>
        {MOCK_SCOPE.notes.map((n) => <span key={n} className={styles.label}>{n}</span>)}
      </div>

      <div role="tablist" aria-label="Roles (mock list)" className={styles.tabs}>
        {MOCK_ROLES.map((r) => (
          <button
            key={r.name}
            role="tab"
            type="button"
            aria-selected={selected === r.name}
            className={cx(styles.tab, selected === r.name && styles.tabActive)}
            onClick={() => setSelected(r.name)}
          >
            {r.name}
            <span className={styles.count}>{r.readOnly ? "Read-only " : ""}{r.assignees}</span>
          </button>
        ))}
      </div>

      {!hasMock ? (
        <Card title={selected}>
          <p className={styles.muted}>No permission matrix is available for this role. The preview only includes sample data for DevOps Engineer, and real mappings must come from the backend.</p>
        </Card>
      ) : (
        <div className={styles.stack}>
          <Card>
            <h2 className={styles.roleTitle}>{MOCK_DEVOPS_ROLE.name} <span className={styles.muted}>(Default Workspace Role)</span> <code className={styles.code}>ID: {MOCK_DEVOPS_ROLE.idLabel}</code></h2>
            <p className={styles.muted}>{MOCK_DEVOPS_ROLE.description}</p>
            <dl className={styles.stats}>
              <div><dt>Active assignees</dt><dd>{MOCK_DEVOPS_ROLE.assignees}</dd></div>
              <div><dt>Cloud meshes</dt><dd>{MOCK_DEVOPS_ROLE.meshes}</dd></div>
              <div><dt>Enforce MFA</dt><dd>{MOCK_DEVOPS_ROLE.mfa}</dd></div>
              <div><dt>Max session</dt><dd>{MOCK_DEVOPS_ROLE.maxSession}</dd></div>
            </dl>
          </Card>

          <PermissionMatrix />

          <div className={styles.sodGrid}>
            {MOCK_SOD_RULES.map((s) => (
              <Card key={s.rule} title={s.title} actions={<StatusBadge tone="accent">{`SoD rule ${s.rule}`}</StatusBadge>}>
                <p className={styles.muted}>{s.body}</p>
                <p className={styles.sodFoot}><strong>{s.status}</strong><span className={styles.muted}>{s.note}</span></p>
              </Card>
            ))}
          </div>

          <Card>
            <div className={styles.compliance}>
              <div className={styles.ring} role="img" aria-label={`Compliance index ${MOCK_COMPLIANCE.index} percent (mock)`}
                style={{ background: `conic-gradient(var(--color-primary) ${MOCK_COMPLIANCE.index}%, var(--color-surface-high) 0)` }}>
                <span>{MOCK_COMPLIANCE.index}%</span>
              </div>
              <div className={styles.grow}>
                <h2 className={styles.roleTitle}>Role Least-Privilege Compliance Index</h2>
                <p className={styles.muted}>{MOCK_COMPLIANCE.text}</p>
              </div>
              <div>
                <p className={styles.label}>Next periodic attestation</p>
                <p>{MOCK_COMPLIANCE.nextAttestation}</p>
                <Button variant="ghost" disabled>Run Attestation Job (not connected)</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <footer className={styles.draftBar}>
        <span>Draft workspace state: policy editing is not connected to a backend.</span>
        <Button variant="ghost" disabled>Discard Draft (not connected)</Button>
        <Button disabled><Icon name="save" size={16} />Save Changes &amp; Push to Meshes (not connected)</Button>
      </footer>
    </>
  );
}
